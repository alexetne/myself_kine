# Conventions API

- Préfixe `/api/v1`, JSON UTF-8 et propriétés `snake_case`.
- Dates et instants RFC 3339 ; fuseau IANA obligatoire pour les données quotidiennes.
- Pagination par curseur, limite par défaut 20 et maximale 100.
- `Idempotency-Key` obligatoire pour les créations sensibles ; même clé avec un autre corps → `409`.
- `If-Match` obligatoire pour les écritures concurrentes concernées.
- Le propriétaire vient du jeton, jamais du corps ou de l'URL.
- Identifiant de requête renvoyé dans `X-Request-Id` et dans les erreurs.

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "user_message": "Certaines informations sont invalides.",
    "technical_message": "Request validation failed.",
    "invalid_fields": [{ "field": "sleep_quality", "code": "OUT_OF_RANGE" }],
    "request_id": "req_..."
  }
}
```

Le document OpenAPI généré est la référence vérifiée en CI.
