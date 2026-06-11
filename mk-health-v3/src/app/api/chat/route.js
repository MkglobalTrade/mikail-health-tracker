export async function GET() {
  return new Response(JSON.stringify({ message: 'chat endpoint placeholder' }), { headers: { 'Content-Type': 'application/json' } });
}
