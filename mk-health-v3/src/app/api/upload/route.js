export async function GET() {
  return new Response(JSON.stringify({ message: 'upload endpoint placeholder' }), { headers: { 'Content-Type': 'application/json' } });
}
