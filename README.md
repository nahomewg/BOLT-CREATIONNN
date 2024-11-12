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

# Netlify Deployment Guide

## Prerequisites

- A Supabase account and database
- A Netlify account
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Environment Setup

Create two environment files in your project root:

- **.env.local**
  ```
  DATABASE_URL="postgresql://username:password@localhost:5432/dbname?sslmode=require"
  NEXTAUTH_SECRET="your-random-secret"
  ANTHROPIC_API_KEY="your-claude-api-key"
  NEXTAUTH_URL="http://localhost:3000"
  ```

- **.env.supabase**
  ```
  DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require"
  NEXTAUTH_SECRET="your-random-secret"
  ANTHROPIC_API_KEY="your-claude-api-key"
  NEXTAUTH_URL="https://your-netlify-url.netlify.app"
  ```

## Database Setup

1. **Create a new Supabase project**
   - Get your database connection string from Supabase: 
     - Project Settings > Database > Connection String
   - Replace `[YOUR-PASSWORD]` with your database password

2. **Initialize your database**
   ```sh
   npx prisma generate
   npx prisma db push
   ```

## Netlify Setup

1. **Connect your repository to Netlify**:
   - Log into Netlify
   - Click "New site from Git"
   - Choose your repository
   - Select the branch to deploy

2. **Configure build settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Add environment variables in Netlify**:
   - Navigate to: Site Settings > Environment variables
   - Add all variables from your `.env.supabase` file

4. **Enable Edge Functions**:
   - Navigate to: Site Settings > Functions > Edge Functions
   - Toggle "Enable Edge Functions"

## Deployment Steps

1. **Ensure your code is committed and pushed to your repository**

2. **Deploy using either method**:

   - **Option 1: Automatic Deployment**
     - Push to your main branch
     - Netlify will automatically build and deploy

   - **Option 2: Manual Deployment**
     ```sh
     # Install Netlify CLI
     npm install netlify-cli -g
     # Login to Netlify
     netlify login
     # Link your local project
     netlify link
     # Deploy
     netlify deploy --prod
     ```

## Post-Deployment Checks

- **Verify database connection**:
  ```sh
  npm run test:db
  ```

- **Check environment variables**:
  ```sh
  npm run db:status
  ```

- **Verify authentication**:
  - Try registering a new user
  - Test login functionality
  - Confirm session persistence

## Troubleshooting

### Common Issues and Solutions

- **Database Connection Errors**
  - Verify `DATABASE_URL` format
  - Check if IP is whitelisted in Supabase
  - Confirm SSL mode is set to "require"

- **Build Failures**
  - Check build logs in Netlify
  - Verify all dependencies are installed
  - Confirm Node.js version (should be 18+)

- **Authentication Issues**
  - Verify `NEXTAUTH_URL` matches your Netlify URL
  - Check `NEXTAUTH_SECRET` is set
  - Confirm database tables are properly migrated

## Monitoring

- **Set up error monitoring**:
  - Enable Netlify analytics
  - Configure error tracking
  - Monitor build logs

- **Database monitoring**:
  - Check Supabase dashboard
  - Monitor connection pool
  - Track query performance

## Security Considerations

- **Environment Variables**:
  - Never commit `.env` files
  - Use Netlify environment variables
  - Rotate secrets regularly

- **Database Security**:
  - Use strong passwords
  - Enable SSL connections
  - Regularly update permissions

- **Authentication**:
  - Enable rate limiting
  - Implement password policies
  - Monitor failed login attempts

## Maintenance

- **Regular maintenance tasks**:
  - **Update dependencies**: `npm update`
  - **Check for security updates**: `npm audit`
  - **Monitor database performance**:
    - Check Supabase metrics
    - Optimize slow queries
    - Maintain indexes

- **Backup strategy**:
  - Enable Supabase backups
  - Download periodic backups
  - Test restoration process

---

For more detailed information about specific features, check the respective documentation:

- [Netlify Next.js Plugin](https://docs.netlify.com/integrations/frameworks/next-js/)
- [Supabase Documentation](https://supabase.com/docs)
- [NextAuth.js Guide](https://next-auth.js.org/getting-started/introduction)
