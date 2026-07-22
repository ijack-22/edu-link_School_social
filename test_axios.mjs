import axios from 'axios';
const client = axios.create({ baseURL: '/api/v1' });
console.log(client.getUri({ url: 'users/auth/login/' }));
