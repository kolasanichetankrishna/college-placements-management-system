const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

if (useMock) {
  // Fetch data from mock/mockData.ts
} else {
  // Call real /api/ai-analysis or other API endpoints
}
