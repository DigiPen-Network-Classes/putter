import { PM } from './pm.js'

test('status code is 200', () => {
    let pm = new PM();
    pm.response.actualStatusValue = 200;

    pm.test('status code is 200', function() {
        pm.response.to.have.status(200);
    })
});

test('status code is NOT 200', () => {
    let pm = new PM();
    pm.response.actualStatusValue = 404;

    expect(() => {
        pm.test('status code is 200', function() {
            pm.response.to.have.status(200);
        });
    }).toThrow();
});

test('should return a user ID', () => {
    let pm = new PM();
    let jsonData = {
        id: 1,
        username: 'bob',
        password: 'testpassword',
        avatar: 'testavatar'
    };
    
    pm.test('should return a user ID', function() {
        pm.expect(jsonData).to.have.property('id');
        pm.expect(jsonData.id).not.to.be.empty;
    });
});

test('should understand types', ()=> {
    let pm = new PM();;
    let jsonData = {
        username: 'Bob',
        score: 12345
    };
    pm.test('should be a number', ()=> {
        pm.expect(jsonData.score).to.be.type('number');
        pm.expect(jsonData.username).to.be.type('string');
    });
});

test('should understand when types dont match', ()=> {
    let pm = new PM();;
    let jsonData = {
        username: 'Bob',
        score: '12345'
    };
    expect(()=>{
        pm.test('should be a number', ()=> {
            pm.expect(jsonData.score).to.be.type('number');
        });
    }).toThrow();
});

test('failed to return anything results in error', ()=> {
    let pm = new PM();

    expect(() => {
        pm.test('should not have a value', ()=> {
            pm.expect(undefined).to.have.property('id');
        });
    }).toThrow();
});

test('failed to return anything results in error', ()=> {
    let pm = new PM();
    let jsonData = {};

    expect(() => {
        pm.test('should not have a value', ()=> {
            pm.expect(jsonData).to.have.property('id');
        });
    }).toThrow();
});

test('should return the username', ()=> {
    let pm = new PM();
    pm.environment.set("testUser", "testdood");
    let jsonData = { username: "testdood"};

    pm.test('should return username', ()=> {
        pm.expect(jsonData).to.have.property('username');
        pm.expect(jsonData.username).to.equal(pm.environment.get('testUser'));
    })
});

test('failed to return username', ()=>{
    let pm = new PM();
    pm.environment.set('testUser', 'otherdood');
    let jsonData = { username: 'testdood'};
    expect(()=> {
        pm.test('should fail', ()=> {
            pm.expect(jsonData.username).to.equal(pm.environment.get('testUser'));
        })
    }).toThrow();
});

test('id is not same as username', ()=> {
    let pm = new PM();
    let jsonData = { username: "username", id: "somethingElse"};

    pm.test('id not same as username', ()=> {
        pm.expect('a').to.not.equal('b');
    });
});

test('id is same as username', ()=> {
    let pm = new PM();
    let jsonData = { username: "a", id: "a"};

    expect(()=> {
        pm.test('id should not be same as username', ()=> {
            pm.expect(jsonData.username).to.not.equal(jsonData.id);
        });
    }).toThrow();
});

test('id is not same as password', ()=>{
    let pm = new PM();
    let jsonData = { id: 'a', password: 'b' };
    pm.test('id should not be same as password', ()=> {
        pm.expect(jsonData.password).to.not.equal(jsonData.id);
    });
});

test('id is same as password', ()=>{
    let pm = new PM();
    let jsonData = { id: 'a', password: 'a' };
    expect(()=>{        
     pm.test('id should not be same as password', ()=> {
            pm.expect(jsonData.password).to.not.equal(jsonData.id);
        });
    }).toThrow();
});


test('user id and session should not be same', ()=> {
    let pm = new PM();
    pm.environment.set("userId", "userId");
    let jsonData = { session: "sessionId"};

    pm.test('user ID and session should not be the same', ()=> {
        pm.expect(jsonData.session).to.not.be.equal(pm.environment.get('userId'));
    })
});
