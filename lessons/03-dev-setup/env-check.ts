import 'dotenv/config';

// Checks that the AI Gateway is configured. Never prints the full key.
function main() {
  console.log('🔍 Checking environment configuration...\n');

  const oidc = process.env.VERCEL_OIDC_TOKEN ?? '';
  const key = process.env.AI_GATEWAY_API_KEY ?? '';
  const hasOIDC = oidc.length > 0;
  const hasKey = key.length > 0 && !key.startsWith('your_');

  if (hasOIDC) {
    console.log('✅ VERCEL_OIDC_TOKEN found - Vercel AI Gateway with OIDC auth');
  } else {
    console.log('❌ VERCEL_OIDC_TOKEN not found');
  }

  if (hasKey) {
    console.log(`✅ AI_GATEWAY_API_KEY found - key preview: ${key.slice(0, 4)}…`);
  } else {
    console.log('❌ AI_GATEWAY_API_KEY not set (missing or still the placeholder)');
  }

  console.log('\n📋 Summary:');
  if (hasOIDC || hasKey) {
    console.log('✅ Environment is configured correctly!');
    console.log(hasOIDC ? '   Using: Vercel AI Gateway (OIDC)' : '   Using: Vercel AI Gateway (API key)');
  } else {
    console.log('❌ No AI Gateway configuration found!');
    process.exitCode = 1;
  }
}

main();
