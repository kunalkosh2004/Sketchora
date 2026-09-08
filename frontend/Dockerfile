FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# `npm ci` is preferred, but Tailwind v4's @tailwindcss/oxide ships
# platform-specific optional deps that a macOS-generated lockfile doesn't
# include, which makes `npm ci` fail on linux. `npm install` resolves the
# platform optionals at build time while still honoring the lockfile.
RUN npm install --no-audit --no-fund

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]