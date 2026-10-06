# Migrations

When a Neon PostgreSQL `DATABASE_URL` + `DIRECT_URL` are set, run:

```bash
npm run prisma:migrate
# or, for production:
npm run prisma:deploy
```

`prisma migrate dev` will read `prisma/schema.prisma` and generate the first
migration (`0001_init`) from it.
