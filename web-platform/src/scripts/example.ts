import { prisma } from "../lib/prisma";

async function main() {
  const user = await prisma.user.create({
    data: {
      username: "Alice",
      password: "securepassword123", // normally you'd hash this
    },
  });

  console.log("Created user:", user);

  // Fetch all users
  const allUsers = await prisma.user.findMany({
    include: {
      interests: true,
      memberships: true,
    },
  });

  console.log("All users:", JSON.stringify(allUsers, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });