// Release e upload de source maps do Sentry no build (KD-45). Puro para ser testável sem rede.

// O build de produção roda na Cloudflare Pages (CF_PAGES_COMMIT_SHA); GITHUB_SHA cobre um build no CI
export function sentryRelease(env) {
  return env.VITE_SENTRY_RELEASE || env.CF_PAGES_COMMIT_SHA || env.GITHUB_SHA || undefined
}

// Sem token (build local e de PR) não há upload: o build segue igual e nenhum segredo é exigido
export function sentryPluginOptions(env) {
  if (!env.SENTRY_AUTH_TOKEN) return null
  return {
    org: env.SENTRY_ORG,
    project: env.SENTRY_PROJECT,
    authToken: env.SENTRY_AUTH_TOKEN,
    release: { name: sentryRelease(env) },
    // Os mapas vão só para o Sentry: apagar evita publicá-los no site
    sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.map'] },
    telemetry: false,
  }
}
