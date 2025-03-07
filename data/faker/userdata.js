import { faker } from "@faker-js/faker/locale/id_ID";
import fs from "fs";

// Load the user data from userdatasample.json
const gpslocation = JSON.parse(fs.readFileSync("gpslocation.json", "utf-8"));

const generateFakeData = (count = 10) => {
    const data = [];

    for (let i = 0; i < count; i++) {
        const bankAccountNumber = "6320" + faker.datatype.number({ min: 100000, max: 999999 });
        const name = faker.name.fullName();
        const location= {
            type : "Point",
            coordinates : [
                gpslocation.jakarta_coordinates[i].longitude,  gpslocation.jakarta_coordinates[i].latitude
            ]
        }
        data.push({ name, bankAccountNumber, location });
    }

    return data;
};

// Generate 100 fake records
const fakeData = generateFakeData(100);

// Save to JSON file
fs.writeFileSync("userdatasample1.json", JSON.stringify(fakeData, null, 2));

console.log("Fake data has been generated and saved to fakeData.json");
