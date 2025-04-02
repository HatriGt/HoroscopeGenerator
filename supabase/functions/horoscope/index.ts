import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    if (path === 'search') {
      const query = url.searchParams.get('q');
      const response = await fetch(`https://www.prokerala.com/astrology/search.php?q=${query}`);
      const data = await response.text();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path === 'match') {
      const formData = await req.formData();
      const response = await fetch('https://www.prokerala.com/astrology/jathagam-porutham-tamil.php', {
        method: 'POST',
        body: formData,
        headers: {
          'Origin': 'https://www.prokerala.com',
          'Referer': 'https://www.prokerala.com/astrology/jathagam-porutham-tamil.php',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
        },
      });
      const data = await response.text();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path === 'nakshatra') {
      const formData = await req.formData();
      const response = await fetch('https://www.prokerala.com/astrology/nakshatra-finder/', {
        method: 'POST',
        body: formData,
        headers: {
          'Origin': 'https://www.prokerala.com',
          'Referer': 'https://www.prokerala.com/astrology/nakshatra-finder/',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
        },
      });
      const data = await response.text();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});