export const getUsers = (req, res) => {
    console.log("Received body:", req.body);
    const users = [
        { id: 1, name: "John Doe" },
        { id: 2, name: "Alice Johnson" },
        { id: 3, name: "Bob Smith" },
        { id: 4, name: "Charlie Brown" }
    ];
    res.json(users);
};

export const createUser = (req, res) => {
    try {
        console.log("Received body:", req.body); // Debugging line
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }

        const newUser = {
            id: Math.floor(Math.random() * 1000), // Generate a random ID
            name
        };

        res.status(201).json({ message: `User ${name} created.`, user: newUser });
    }
    catch (error) {
        console.log(error);
    }

};
