/**                            {    Use Fira Code to see the decoration   }
 * <| ||=<<=>>=<<=>>=<<<$>>>==||Guide to create your own permanent account||==<<<$>>>=<<=>>=<<=>>=|| |>
 * 
 *  This will show you the format to introduce your own account easily, this can't be done via the page
 *  due some technical limitations to read / write files using only JavaScript.
 *  Only need to replace the items inside asterisk: *DATA* |==>> "mydata"
 * 
 * 
 *  The step-by-step on how to add your data with templates for you to fill: 
 * 
 * 1|> Inside [externalUserData] add: 
   [*ID NUMBER*, {
        "name": *NAME*, 
        "id": *ID NUMBER*, 
        "email": *EMAIL*,
        "phone": *PHONE NUMBER*,
        "pass": "mangled + *PASSWORD*",
    }
   ],
 * 
 * 2|> Inside [bankData] add:
   [*ID NUMBER*, {
        "name": *NAME*, 
        "id": *ID NUMBER*, 
        "pass": mangled + *PASSWORD*,
        "code": "mangledBD93F9 + *NAME* + *ID NUMBER*",
        "balance": *ANY NUMBER*,
        "currency": "USD" or "COP"
    }
    ],
 * 
 *  3|> Remember to save the file and reload the login page.
 * 
 */ 

let externalUserData = new Map([
    ["50331778", {
        "name": "Daniel", 
        "id": "50331778", 
        "email": "email@gmail.com",
        "phone": "3001002030",
        "pass": "mangledUn@PassS3gur4",
    }
    ],
    ["12345667", {
        "name": "Otro", 
        "id": "12345667", 
        "email": "other@gmail.com",
        "phone": "3190454235",
        "pass": "mangledSOMEHASH2",
    }
    ],
    ["87654321", {
        "name": "Hmmm", 
        "id": "87654321", 
        "email": "third@gmail.com",
        "phone": "3006906969",
        "pass": "mangledSOMEHASH3",
    }
    ],
    ["123456789", {
        "name": "Dummy", 
        "id": "123456789", 
        "email": "dummy.mail@demail.com",
        "phone": "3121231212",
        "pass": "mangledDummyPassword",
    }
   ],
   ["6969", {
    "name": "Admin", 
    "id": "6969", 
    "email": "admin.admin@dpmail.com",
    "phone": "3006096969",
    "pass": "mangledPass",
}
],
]);

let bankData = new Map([
    ["6969", {
        "name": "Admin", 
        "id": "6969", 
        "pass": "mangledPass",
        "code": "mangledBD93F9Admin6969",
        "balance": "69000000",
        "currency": "COP"
    }
    ],
    ["50331778", {
        "name": "Daniel", 
        "id": "50331778",
        "pass": "mangledUn@PassS3gur4",
        "code": "mangledBD93F9Daniel50331778",
        "balance": "69",
        "currency": "USD"
    }
    ],
    ["12345667", {
        "name": "Otro", 
        "id": "12345667",
        "pass": "mangledSOMEHASH2",
        "code": "mangledBD93F9Otro12345667",
        "balance": "100",
        "currency": "COP"
    }
    ],
    ["87654321", {
        "name": "Hmmm", 
        "id": "87654321", 
        "pass": "mangledSOMEHASH3",
        "code": "mangledBD93F9Hmmm87654321a",
        "balance": "0",
        "currency": "COP"
    }
    ],
    ["123456789", {
        "name": "Dummy", 
        "id": "123456789", 
        "pass": "mangledDummyPassword",
        "code": "mangledBD93F9Dummy123456789",
        "balance": "0",
        "currency": "USD"
    }
    ],
]);