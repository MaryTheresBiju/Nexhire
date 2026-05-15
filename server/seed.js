const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB for seeding'))
  .catch(err => console.error(err));

const seedDatabase = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash('password123', salt);

    const employer = new User({
      name: 'Google India HR',
      email: 'hr@google.com',
      password: hashedPass,
      role: 'employer',
      companyName: 'Google India'
    });
    await employer.save();

    const candidate = new User({
      name: 'Alice Software',
      email: 'alice@example.com',
      password: hashedPass,
      role: 'candidate',
      bio: 'Enthusiastic full stack developer.',
      skills: ['JavaScript', 'React', 'Node.js']
    });
    await candidate.save();

    const job1 = new Job({
      title: 'Full Stack Engineer',
      employerId: employer._id.toString(),
      company: employer.companyName,
      location: 'Hyderabad',
      salary: '2500000',
      description: 'Join Google to build next-generation web applications.',
      requirements: ['React', 'Node.js', 'System Design'],
      qualifications: ['B.Tech / M.Tech'],
      experience: '4+ years'
    });
    await job1.save();

    const job2 = new Job({
      title: 'UX Designer',
      employerId: employer._id.toString(),
      company: employer.companyName,
      location: 'Remote',
      salary: '1800000',
      description: 'Looking for a creative UX designer for our core products.',
      requirements: ['Figma', 'Prototyping', 'User Research'],
      qualifications: ['Design Degree'],
      experience: '2-4 years'
    });
    await job2.save();

    console.log('Database seeded successfully with dummy jobs and users!');
    process.exit();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDatabase();
