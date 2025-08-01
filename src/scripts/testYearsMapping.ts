// Year mapping from frontend to database values
const YEAR_MAPPING: { [key: string]: string } = {
  'First': '1st',
  'Second': '2nd', 
  'Third': '3rd',
  'Fourth': '4th',
  '1st': '1st',
  '2nd': '2nd',
  '3rd': '3rd',
  '4th': '4th'
};

function testYearMapping() {
  console.log('🧪 Testing Year Mapping Logic...');
  
  const testCases = [
    'Second',
    'Third', 
    'Fourth',
    '2nd',
    '3rd',
    '4th',
    'Invalid'
  ];
  
  testCases.forEach(testCase => {
    const mapped = YEAR_MAPPING[testCase] || testCase;
    console.log(`Frontend: "${testCase}" -> Database: "${mapped}"`);
  });
  
  // Test the array mapping logic
  console.log('\n🧪 Testing Array Mapping Logic...');
  
  const yearsFilter = 'Second';
  let yearsArray: string[] = [];
  if (typeof yearsFilter === 'string') {
    yearsArray = [yearsFilter];
  }
  
  const mappedYears = yearsArray.map((year: string) => YEAR_MAPPING[year] || year);
  console.log(`Input: "${yearsFilter}"`);
  console.log(`As Array: ${JSON.stringify(yearsArray)}`);
  console.log(`Mapped: ${JSON.stringify(mappedYears)}`);
  
  // Test with multiple years
  const multipleYears = ['Second', 'Third'];
  const mappedMultiple = multipleYears.map((year: string) => YEAR_MAPPING[year] || year);
  console.log(`\nMultiple Input: ${JSON.stringify(multipleYears)}`);
  console.log(`Multiple Mapped: ${JSON.stringify(mappedMultiple)}`);
}

testYearMapping(); 