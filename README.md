# Next.js on Netlify Platform Starter

[Live Demo](https://nextjs-platform-starter.netlify.app/)

A modern starter based on Next.js 14 (App Router), Tailwind, daisyUI, and [Netlify Core Primitives](https://docs.netlify.com/core/overview/#develop) (Edge Functions, Image CDN, Blob Store).

In this site, Netlify Core Primitives are used both implictly for running Next.js features (e.g. Route Handlers, image optimization via `next/image`, and more) and also explicitly by the user code. 

Implicit usage means you're using any Next.js functionality and everything "just works" when deployed - all the plumbing is done for you. Explicit usage is framework-agnostic and typically provides more features than what Next.js exposes.

## Deploying to Netlify

This site requires [Netlify Next Runtime v5](https://docs.netlify.com/frameworks/next-js/overview/) for full functionality. That version is now being gradually rolled out to all Netlify accounts. 

After deploying via the button below, please visit the **Site Overview** page for your new site to check whether it is already using the v5 runtime. If not, you'll be prompted to opt-in to to v5.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/netlify-templates/next-platform-starter)

## Developing Locally

1. Clone this repository, then run `npm install` in its root directory.

2. For the starter to have full functionality locally (e.g. edge functions, blob store), please ensure you have an up-to-date version of Netlify CLI. Run:

```
npm install netlify-cli@latest -g
```

3. Link your local repository to the deployed Netlify site. This will ensure you're using the same runtime version for both local development and your deployed site.

```
netlify link
```

4. Then, run the Next.js development server via Netlify CLI:

```
netlify dev
```

If your browser doesn't navigate to the site automatically, visit [localhost:8888](http://localhost:8888).


# Database Setup

This project supports both local PostgreSQL and Supabase databases. Here's how to set up and switch between them:

## Initial Setup

Create two environment files:

- **.env.local**: Environment file for local PostgreSQL setup
- **.env.supabase**: Environment file for Supabase setup

## Switching Between Databases

The project includes built-in scripts to switch between databases:

- Run the appropriate script to toggle between local and Supabase environments.

## Database Operations

After switching databases, you may need to run these commands:

- `npx prisma migrate dev` to apply database migrations.
- `npx prisma db seed` to seed the database (if needed).

## Testing Database Connection

You can verify your database connection by running:

```sh
npx prisma db pull
```

This will attempt to connect to the database and display the current connection status.

## Important Notes

- **Data between databases is not automatically synced**: Be careful when switching databases, as data from one environment will not be reflected in the other.
- **Always backup data before switching databases**: To avoid data loss, always create a backup.
- **Supabase connection requires SSL by default**: Ensure your SSL settings are correctly configured.
- **Local PostgreSQL setup**: Make sure PostgreSQL is installed and running for local development.
- **Supabase IP whitelisting**: When using Supabase, ensure your IP address is whitelisted in the Supabase dashboard.

## Environment Variables

Your `.env` file should contain these variables:

- `DATABASE_URL`: Your database connection string
- `NEXTAUTH_SECRET`: Random string for session encryption
- `ANTHROPIC_API_KEY`: Your Claude API key
- `NEXTAUTH_URL`: Your application URL

---

Feel free to contribute or ask questions if you need further clarification!
