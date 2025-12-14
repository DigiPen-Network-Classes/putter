use admin
db.createUser({
    user: "cs261",
    pwd: "YourStrongPassword",
    roles: [ 
    { role: "dbOwner", db: "user-service" },
    { role: "dbAdmin", db: "user-service" },
    { role: "readWrite", db: "user-service" }]
});

