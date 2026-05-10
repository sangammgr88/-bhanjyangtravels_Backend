const fetch = require('node-fetch');

async function testAuth() {
  const baseURL = 'http://localhost:8080';
  
  try {
    console.log('🔐 Testing Authentication Flow...\n');
    
    // Step 1: Login
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@travel.com',
        password: 'FY&v1WPU@4Jy'
      }),
    });
    
    if (!loginResponse.ok) {
      const error = await loginResponse.json();
      console.error('❌ Login failed:', error);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('User role:', loginData.data.user.role);
    
    // Extract cookies properly
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Raw cookies:', cookies);
    
    // Parse cookies more carefully
    const cookiePairs = cookies ? cookies.split(',').map(c => c.trim()) : [];
    const cookieHeader = cookiePairs
      .map(cookie => cookie.split(';')[0])
      .filter(cookie => cookie.includes('='))
      .join('; ');
    
    console.log('Parsed cookie header:', cookieHeader);
    
    // Step 2: Validate token
    console.log('\n2. Validating token...');
    const validateResponse = await fetch(`${baseURL}/auth/validate`, {
      method: 'POST',
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json',
      },
    });
    
    if (!validateResponse.ok) {
      const error = await validateResponse.json();
      console.error('❌ Token validation failed:', error);
      return;
    }
    
    const validateData = await validateResponse.json();
    console.log('✅ Token validation successful');
    console.log('User data:', validateData.data);
    
    // Step 3: Test trek creation (should work for admin)
    console.log('\n3. Testing trek creation (admin only)...');
    const trekData = {
      title: 'Test Trek',
      slug: 'test-trek',
      description: 'A test trek',
      shortDescription: 'Test trek description',
      duration: 5,
      difficulty: 'Easy',
      maxAltitude: 3000,
      price: 500,
      groupSize: 10,
      startLocation: 'Kathmandu',
      endLocation: 'Pokhara',
      highlights: 'Test highlights',
      itinerary: 'Test itinerary',
      included: 'Test included',
      excluded: 'Test excluded',
      requirements: 'Test requirements',
      bestTime: 'Year Round',
      featured: false,
      thumbnail: 'https://example.com/image.jpg',
      images: []
    };
    
    console.log('Sending request with cookies:', cookieHeader);
    const trekResponse = await fetch(`${baseURL}/treks`, {
      method: 'POST',
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trekData),
    });
    
    console.log('Trek response status:', trekResponse.status);
    console.log('Trek response headers:', trekResponse.headers.raw());
    
    if (!trekResponse.ok) {
      const error = await trekResponse.json();
      console.error('❌ Trek creation failed:', error);
      return;
    }
    
    const trekResult = await trekResponse.json();
    console.log('✅ Trek creation successful');
    console.log('Trek created:', trekResult.data.title);
    
    console.log('\n🎉 All tests passed! Authentication and authorization are working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuth(); 