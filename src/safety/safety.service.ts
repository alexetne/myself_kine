import { ConflictException, Injectable } from "@nestjs/common";
import type { PoolClient } from "pg";

type SafetyLevel = "clear" | "caution" | "professional_review" | "urgent";

interface StoredRule {
  code: string;
  priority: number;
  when: {
    fact: string;
    operator: "eq" | "in" | "exists";
    value?: unknown;
  };
  level: SafetyLevel;
  reason_code: string;
  explanation: string;
}

interface PublishedRuleSet {
  id: string;
  rules: unknown;
}

export interface SafetyResult {
  decision_id: string;
  level: SafetyLevel;
  reason_code: string;
  explanation: string;
  rule_set_version_id: string;
  matched_rule_code: string;
}

@Injectable()
export class SafetyService {
  async evaluate(
    client: PoolClient,
    userId: string,
    submissionId: string,
    answers: Record<string, unknown>,
  ): Promise<SafetyResult> {
    const published = await client.query<PublishedRuleSet>(
      `SELECT rsv.id, rsv.rules
       FROM rule_set rs JOIN rule_set_version rsv ON rsv.rule_set_id=rs.id
       WHERE rs.kind='safety' AND rsv.status='published'
         AND rsv.published_at <= now() AND rsv.disabled_at IS NULL
       ORDER BY rsv.published_at DESC LIMIT 2`,
    );
    if (published.rows.length !== 1)
      throw new ConflictException({
        code: "SAFETY_REFERENCE_NOT_PUBLISHED",
        user_message:
          "La qualification automatique est indisponible pour le moment.",
      });

    const ruleSet = published.rows[0];
    const rules = this.parseRules(ruleSet.rules);
    const matched = rules.find((rule) => this.matches(rule, answers));
    if (!matched)
      throw new ConflictException({
        code: "SAFETY_RULE_NO_MATCH",
        user_message:
          "Les réponses ne permettent pas une qualification automatique.",
      });

    const decision = await client.query<{ id: string }>(
      `INSERT INTO safety_decision(
         user_id, submission_id, rule_set_version_id, level, reason_code,
         explanation, inputs, matched_rule_code
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [
        userId,
        submissionId,
        ruleSet.id,
        matched.level,
        matched.reason_code,
        matched.explanation,
        { questionnaire_submission_id: submissionId, answers },
        matched.code,
      ],
    );
    return {
      decision_id: decision.rows[0].id,
      level: matched.level,
      reason_code: matched.reason_code,
      explanation: matched.explanation,
      rule_set_version_id: ruleSet.id,
      matched_rule_code: matched.code,
    };
  }

  private parseRules(value: unknown): StoredRule[] {
    if (!Array.isArray(value) || value.length === 0)
      throw new ConflictException({ code: "SAFETY_REFERENCE_INVALID" });
    const levels = new Set<SafetyLevel>([
      "clear",
      "caution",
      "professional_review",
      "urgent",
    ]);
    const operators = new Set(["eq", "in", "exists"]);
    const rules = value.map((entry) => {
      if (!entry || typeof entry !== "object")
        throw new ConflictException({ code: "SAFETY_REFERENCE_INVALID" });
      const rule = entry as Partial<StoredRule>;
      if (
        typeof rule.code !== "string" ||
        !Number.isInteger(rule.priority) ||
        !rule.when ||
        typeof rule.when.fact !== "string" ||
        !operators.has(rule.when.operator) ||
        !rule.level ||
        !levels.has(rule.level) ||
        typeof rule.reason_code !== "string" ||
        typeof rule.explanation !== "string"
      )
        throw new ConflictException({ code: "SAFETY_REFERENCE_INVALID" });
      return rule as StoredRule;
    });
    const priorities = new Set(rules.map((rule) => rule.priority));
    if (priorities.size !== rules.length)
      throw new ConflictException({ code: "SAFETY_REFERENCE_INVALID" });
    return rules.sort((left, right) => left.priority - right.priority);
  }

  private matches(rule: StoredRule, facts: Record<string, unknown>): boolean {
    const actual = facts[rule.when.fact];
    if (rule.when.operator === "exists") return actual !== undefined;
    if (rule.when.operator === "eq") return actual === rule.when.value;
    return Array.isArray(rule.when.value) && rule.when.value.includes(actual);
  }
}
