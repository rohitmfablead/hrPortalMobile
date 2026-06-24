const fs = require('fs');
let c = fs.readFileSync('src/components/AddEmployeeModal.tsx', 'utf8');

c = c.replace(/    firstName: '',\n    lastName: '',\n    email: '',\n    phone: '',\n    department: '',\n    role: 'Employee',\n    designation: '',\n    salary: '',\n    joiningDate: new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\],\n    status: 'Active',\n  \}\);/g, '');

fs.writeFileSync('src/components/AddEmployeeModal.tsx', c);
console.log('Fixed');
