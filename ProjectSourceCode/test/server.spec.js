// ********************** Initialize server **********************************

const server = require('../src/index'); //TODO: Make sure the path to your index.js is correctly added

// ********************** Import Libraries ***********************************

const chai = require('chai'); // Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

// ********************** DEFAULT WELCOME TESTCASE ****************************

describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });
});

// *********************** TODO: WRITE 2 UNIT TESTCASES **************************

let testUsername = 'registerman' + Math.floor(Math.random() * 10000); //test a username with random 4 digit number, will not exist in db (kinda scuffed)

//Positive test case
describe('Testing Add User API', () => {
  it('positive : /register', done => {
    chai
      .request(server)
      .post('/register')
      .send({username: testUsername, password: 'password'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        //expect(res.body.message).to.equals('Account created, use credentials to login.');
        done();
      });
  });
});

//Negitive test case
describe('Testing Add User API', () => {
  //it('positive : /register', done => {
  //  // Refer above for the positive testcase implementation
  //});
  it('Negative : /register. Checking invalid name', done => {
    chai
      .request(server)
      .post('/register')
      .send({username: testUsername, password: 'password'})
      .end((err, res) => {
        expect(res).to.have.status(400);
        //expect(res.body.message).to.equals('Username already associated with an account.');
        done();
      });
  });
});

// *********************** TWO MORE UNIT TESTCASES **************************

//Positive test case
describe('Testing Login API', () => {
  it('positive : /Login', done => {
    chai
      .request(server)
      .post('/login')
      .send({username: testUsername, password: 'password'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});

//Negitive test case
describe('Testing Login API', () => {
  it('Negative : /Login. Checking invalid password', done => {
    chai
      .request(server)
      .post('/login')
      .send({username: testUsername, password: 'wrong password'})
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
});

// ********************************************************************************