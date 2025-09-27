// CloudFront Function to add CORS headers
// This function should be deployed to your CloudFront distribution

function handler(event) {
    var response = event.response;
    var headers = response.headers;
    
    // Add CORS headers
    headers['access-control-allow-origin'] = {value: 'https://meetcitadel.vercel.app'};
    headers['access-control-allow-methods'] = {value: 'GET, HEAD'};
    headers['access-control-allow-headers'] = {value: '*'};
    headers['access-control-max-age'] = {value: '3000'};
    
    return response;
}

// Instructions to deploy this function:
// 1. Go to AWS CloudFront Console
// 2. Select your distribution
// 3. Go to Functions tab
// 4. Create a new function
// 5. Paste this code
// 6. Deploy the function
// 7. Go to Behaviors tab
// 8. Edit the behavior for your image path
// 9. Under "Function associations", add this function to "Viewer response"
// 10. Save changes

console.log('CloudFront CORS Function Code Generated');
console.log('Follow the instructions above to deploy this function to your CloudFront distribution'); 