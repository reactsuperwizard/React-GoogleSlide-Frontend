import {
    SignIn, SignUp, DoctorPage, ForgotPassword
} from './components';

const routes = [
    { path: '/signin', exact: true, name: 'SignIn', component: SignIn },
    { path: '/signup', exact: true, name: 'SignUp', component: SignUp },
    { path: '/doctor', exact: true, name: 'Doctor', component: DoctorPage },
    { path: '/forgotpassword', exact: true, name: 'Testing', component: ForgotPassword }
  ];
  
  export default routes;
