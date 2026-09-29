const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');
const Certificate = require('../models/Certificate');
const Feedback = require('../models/Feedback');
const { generateQRCodeDataURL } = require('./qrHelper');

dotenv.config({ path: __dirname + '/../.env' });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/muit_event_db';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    await Registration.deleteMany({});
    await Attendance.deleteMany({});
    await Certificate.deleteMany({});
    await Feedback.deleteMany({});

    console.log('Cleared existing collections.');

    // 1. Create Users
    console.log('Creating demo users...');

    // Admin user
    const admin = await User.create({
      name: 'MUIT Dean / Admin Officer',
      email: 'admin@muit.edu',
      password: 'Password123!',
      phone: '+91 98765 43210',
      enrollmentNumber: 'MUIT/ADM/2022/001',
      course: 'Administration',
      semester: 'N/A',
      role: 'admin',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
    });

    // Organizer user
    const organizer = await User.create({
      name: 'Prof. Rajesh Sharma (Faculty Coordinator)',
      email: 'organizer@muit.edu',
      password: 'Password123!',
      phone: '+91 98765 12345',
      enrollmentNumber: 'MUIT/FAC/CS/042',
      course: 'Computer Science & IT',
      semester: 'Faculty',
      role: 'organizer',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
    });

    // Primary student
    const student = await User.create({
      name: 'Aarav Verma',
      email: 'student@muit.edu',
      password: 'Password123!',
      phone: '+91 99887 76655',
      enrollmentNumber: 'MUIT/BCA/2024/089',
      course: 'BCA (Cloud & AI)',
      semester: '4th Semester',
      role: 'student',
      profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80'
    });

    // Additional sample students
    const student2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@muit.edu',
      password: 'Password123!',
      phone: '+91 91234 56780',
      enrollmentNumber: 'MUIT/BCA/2024/112',
      course: 'BCA (Web Tech)',
      semester: '4th Semester',
      role: 'student'
    });

    const student3 = await User.create({
      name: 'Rohan Gupta',
      email: 'rohan@muit.edu',
      password: 'Password123!',
      phone: '+91 98223 34455',
      enrollmentNumber: 'MUIT/MCA/2025/034',
      course: 'MCA',
      semester: '2nd Semester',
      role: 'student'
    });

    const student4 = await User.create({
      name: 'Ananya Mishra',
      email: 'ananya@muit.edu',
      password: 'Password123!',
      phone: '+91 97788 99001',
      enrollmentNumber: 'MUIT/BTECH/2023/156',
      course: 'B.Tech CSE',
      semester: '6th Semester',
      role: 'student'
    });

    console.log('Created Users: Admin, Organizer, Aarav (student), Priya, Rohan, Ananya.');

    // 2. Create Sample Events
    console.log('Seeding Sample Events with Official MUIT Posters...');

    const sampleEventsData = [
      {
        title: 'Aagaaz 2026: Welcome Batch of 2026',
        description: 'Welcome Batch of 2026 — A joyful start to Maharishi University of Information Technology Life.\n\nOrganized By: Senior Students of Maharishi School of Engineering & Technology (MSOET), MUIT Lucknow Campus.\n\nCelebrate the beginning of your university journey with vibrant cultural performances, campus traditions, music, interactive team games, and peer mentorship sessions. Open for all newly joined BCA, B.Tech, MCA, and Diploma students!',
        category: 'Cultural',
        image: '/images/aagaaz-2026.jpg',
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        startTime: '12:00 PM',
        endTime: '05:00 PM',
        duration: '5 Hours',
        venue: 'Sport Ground, Maharishi University of Information Technology, Lucknow Campus',
        capacity: 600,
        registeredCount: 0,
        registrationDeadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000),
        organizer: organizer._id,
        organizerName: 'Senior Students of MSOET & Cultural Committee',
        status: 'Registration Open'
      },
      {
        title: 'Badminton Summer Camp 2026',
        description: 'MUIT Summer Sports Camp — Intensive professional badminton training and conditioning.\n\nCamp Schedule & Timings:\n• Morning Session: 06:00 AM – 08:00 AM\n• Evening Session: 03:00 PM – 06:00 PM\n\nFees & Registration Details:\n• Registration Fee: ₹0/- (Free Registration)\n• College T-Shirt Fee: ₹200/- per T-Shirt (Mandatory for all interested players)\n• Registration Venue: Sports Room\n• T-Shirt Distribution Venue: Sports Room\n• Registration Timing: 2:00 PM to 5:00 PM\n\nContact Persons & Coaches:\n• Arjun Singh (Cricket Coach): +91 83768 92322\n• Gaurav Mishra (Football Coach): +91 98185 38793\n• Alfisha Khan (Sports Coach): +91 98211 57465\n\nInterested players must register immediately. Slots are limited to ensure quality coaching.',
        category: 'Sports',
        image: '/images/badminton-camp-2026.jpg',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        startTime: '06:00 AM',
        endTime: '06:00 PM',
        duration: 'Morning & Evening Sessions',
        venue: 'Sports Room & Badminton Court, MUIT Noida Campus',
        capacity: 100,
        registeredCount: 0,
        registrationDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        organizer: organizer._id,
        organizerName: 'Sports Department, MUIT Noida',
        status: 'Registration Open'
      },
      {
        title: 'Volleyball Summer Camp 2026',
        description: 'MUIT Summer Sports Camp — Comprehensive volleyball fundamentals, spikes, blocks, and tournament strategy.\n\nCamp Schedule & Timings:\n• Morning Session: 06:00 AM – 08:00 AM\n• Evening Session: 03:00 PM – 06:00 PM\n\nFees & Registration Details:\n• Registration Fee: ₹0/- (Free Registration)\n• College T-Shirt Fee: ₹200/- per T-Shirt (Mandatory for all interested players)\n• Registration Venue: Sports Room\n• T-Shirt Distribution Venue: Sports Room\n• Registration Timing: 2:00 PM to 5:00 PM\n\nContact Persons & Coaches:\n• Arjun Singh (Cricket Coach): +91 83768 92322\n• Gaurav Mishra (Football Coach): +91 98185 38793\n• Alfisha Khan (Sports Coach): +91 98211 57465\n\nInterested players must register immediately. Slots are limited to ensure quality coaching.',
        category: 'Sports',
        image: '/images/volleyball-camp-2026.png',
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        startTime: '06:00 AM',
        endTime: '06:00 PM',
        duration: 'Morning & Evening Sessions',
        venue: 'Sports Ground & Volleyball Arena, MUIT Noida Campus',
        capacity: 100,
        registeredCount: 0,
        registrationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        organizer: organizer._id,
        organizerName: 'Sports Department, MUIT Noida',
        status: 'Registration Open'
      },
      {
        title: 'Basketball Summer Camp 2026',
        description: 'MUIT Summer Sports Camp — Elite basketball drills, offensive schemes, fast breaks, and fitness conditioning.\n\nCamp Schedule & Timings:\n• Morning Session: 06:00 AM – 08:00 AM\n• Evening Session: 03:00 PM – 06:00 PM\n\nFees & Registration Details:\n• Registration Fee: ₹0/- (Free Registration)\n• College T-Shirt Fee: ₹200/- per T-Shirt (Mandatory for all interested players)\n• Registration Venue: Sports Room\n• T-Shirt Distribution Venue: Sports Room\n• Registration Timing: 2:00 PM to 5:00 PM\n\nContact Persons & Coaches:\n• Arjun Singh (Cricket Coach): +91 83768 92322\n• Gaurav Mishra (Football Coach): +91 98185 38793\n• Alfisha Khan (Sports Coach): +91 98211 57465\n\nInterested players must register immediately. Slots are limited to ensure quality coaching.',
        category: 'Sports',
        image: '/images/basketball-camp-2026.png',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        startTime: '06:00 AM',
        endTime: '06:00 PM',
        duration: 'Morning & Evening Sessions',
        venue: 'Basketball Court & Sports Room, MUIT Noida Campus',
        capacity: 100,
        registeredCount: 0,
        registrationDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        organizer: organizer._id,
        organizerName: 'Sports Department, MUIT Noida',
        status: 'Registration Open'
      },
      {
        title: 'Alumni Meet Fiesta 2026: Live Concert by Monali Thakur',
        description: 'Maharishi University of Information Technology, Lucknow Campus presents the grand Alumni Meet Fiesta 2026!\n\nStar Celebrity Performance:\n"Queen of Hearts" — MONALI THAKUR Live in Concert at MUIT Lucknow!\n\nReunite with university alumni, network with industry pioneers, and immerse yourself in an electrifying musical performance featuring Monali Thakur singing her celebrated Bollywood chartbusters. Open to all students, faculty, and esteemed alumni.',
        category: 'Cultural',
        image: '/images/alumni-meet-monali-thakur.png',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        startTime: '06:00 PM',
        endTime: '10:30 PM',
        duration: '4 Hours 30 Mins',
        venue: 'Main Central Grounds & Auditorium, MUIT Lucknow Campus',
        capacity: 1500,
        registeredCount: 0,
        registrationDeadline: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
        organizer: organizer._id,
        organizerName: 'MUIT Alumni Association & Cultural Council',
        status: 'Registration Open'
      },
      {
        title: 'Byte Bash: The Technical Quiz Challenge',
        description: 'Organized by Tech-Sutra (A Technical Club Organizing Events to Inspire Students at Maharishi School of Engineering & Technology, MUIT Lucknow).\n\n"THINK. TEST. CONQUER."\nAre you ready to challenge your Tech IQ? Byte Bash is an intensive, high-energy technical quiz challenge designed to test your algorithmic thinking, core computer science fundamentals, data structures, programming logic, and rapid problem-solving acumen.\n\nVenue: MSOET Seminar Room, Sitapur Road, P.O-Maharishi Vidya Mandir, Lucknow (UP) 226013\nReporting Time: 01:00 PM | Duration: 3 Hours 30 Mins\n\nStudent Coordinators:\n• Ms. Soma Tiwari: +91 9555664979\n• Mr. Shubham Singh: +91 9682725882\n\nRegistration is open for all BCA, MCA, and B.Tech engineering students!',
        category: 'Competition',
        image: '/images/byte-bash.jpeg',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        startTime: '01:00 PM',
        endTime: '04:30 PM',
        duration: '3 Hours 30 Mins',
        venue: 'MSOET Seminar Room, MUIT Lucknow Campus',
        capacity: 150,
        registeredCount: 0,
        registrationDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000),
        organizer: organizer._id,
        organizerName: 'Tech-Sutra & MSOET',
        status: 'Registration Open'
      },
      {
        title: 'Smart India Hackathon (SIH) 2026 — Internal Round',
        description: 'Maharishi University of Information Technology, Lucknow Campus.\nOrganized by: Maharishi School of Engineering & Technology (MSOET) in association with Institution\'s Innovation Council (Ministry of Education Initiative), SIH 2026, and E-Cell MUIT.\n\nThe official University Internal Screening Round for the prestigious Smart India Hackathon 2026. Student innovators will tackle problem statements in AI & Robotics, Clean Energy & Environment, Smart Cities & Transportation, and FinTech Security.\n\nKey Details:\n• 28-Hour Non-stop Ideation & Prototype Building Sprint\n• Reporting Time: 01:00 PM\n• Direct nomination for SIH National Grand Finale for shortlisted teams\n• Faculty mentors & industry evaluators on-site\n\nVenue: Seminar Hall, MSOET, Maharishi University, Lucknow Campus\nTiming: 01:00 PM to 05:00 PM (2-Day Continuous Sprint)',
        category: 'Technical',
        image: '/images/sih-2026.jpeg',
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        startTime: '01:00 PM',
        endTime: '05:00 PM',
        duration: '28 Hours (2-Day Sprint)',
        venue: 'Seminar Hall, MSOET, Maharishi University, Lucknow Campus',
        capacity: 250,
        registeredCount: 0,
        registrationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        organizer: organizer._id,
        organizerName: 'MSOET & Institution\'s Innovation Council',
        status: 'Registration Open'
      },
      {
        title: 'MIIF Seed Fund — Call for Applications (Up to ₹1,00,000)',
        description: 'Organized by: MUIT Incubation & Innovation Foundation (MIIF), Noida/Lucknow.\nSupported by StartinUP, Institution\'s Innovation Council (Ministry of HRD Initiative), and Maharishi University.\n\n"Your Idea | Our Support | A Bigger Tomorrow"\nMIIF Seed Fund is an exclusive opportunity for MUIT student innovators to turn raw ideas and prototypes into viable commercial startups. Apply with your pitch deck to receive funding grants, incubation space, and elite mentorship.\n\nFund Options:\n• TRACK A: MIIF Seed Grant up to ₹50,000 (100% funded by MIIF)\n• TRACK B: MIIF Co-Fund Grant ₹1,00,000 (*₹75,000 MIIF + ₹25,000 Applicant)\n\nKey Benefits:\n• Funding Support (Up to 1,00,000 INR)\n• Mentorship from Industry & Academia Experts\n• Access to Industry Network, Co-working Hubs & Cloud Credits\n• Build and scale your official startup journey\n\nPoint of Contact:\n• Puneet Pandey (Lucknow): 9511115829\n• Srashti Rajput (Noida): 9511115828\nLast Date to Apply: 30 September, 2026',
        category: 'Competition',
        image: '/images/miif-seed-fund.jpeg',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        startTime: '10:00 AM',
        endTime: '06:00 PM',
        duration: '8 Hours (Full Day Pitch Sessions)',
        venue: 'MUIT Incubation & Innovation Foundation (MIIF), Lucknow & Noida Campus',
        capacity: 120,
        registeredCount: 0,
        registrationDeadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        organizer: organizer._id,
        organizerName: 'MUIT Incubation & Innovation Foundation (MIIF)',
        status: 'Registration Open'
      },
      {
        title: 'National Sports Day 2026 — "Ek Ghanta Khel Ke Maidan Mein!!"',
        description: 'Nationwide Celebration of Sports, Spirit & Unity — "Khelega Bharat, Jeetega Bharat" commemorating the Birth Anniversary of Major Dhyan Chand.\n\nOrganized by Sports Committee, Maharishi University (Lucknow Campus) in association with IQAC, Fit India, and Sports Authority of India (SAI).\n\nTournaments & Events:\n• Inter-Departmental Track & Field (100m, 200m, Relay)\n• Badminton Championship (Singles & Mixed Doubles)\n• Volleyball & Football Tournament\n• Tug of War & Table Tennis League\n\nDate & Timing: 2:00 PM onwards | Duration: 5 Hours\nVenue: Sports Ground, Maharishi University, Lucknow Campus\nAll students and faculty are invited to participate with enthusiasm!',
        category: 'Sports',
        image: '/images/sports-day-2026.jpeg',
        date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        startTime: '02:00 PM',
        endTime: '07:00 PM',
        duration: '5 Hours',
        venue: 'Sports Ground, Maharishi University, Lucknow Campus',
        capacity: 400,
        registeredCount: 0,
        registrationDeadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        organizer: organizer._id,
        organizerName: 'Sports Committee & IQAC MUIT',
        status: 'Registration Open'
      },
      {
        title: 'Tech-Sutra: Technical Club Launch & Member Induction',
        description: 'Maharishi University of Information Technology — Maharishi School of Engineering & Technology, Lucknow Campus.\n\n"A Technical Club Organizing Events to Inspire Students"\n\nTech-Sutra is the premier official student technical organization at MUIT Lucknow. Join fellow programmers, developers, designers, and innovators to work on real-world projects, participate in hackathons, and attend peer learning circles.\n\nStudent Leadership:\n• Soma Tiwari (B.Tech President)\n• Shubham Singh (B.Tech Member Secretary)\n• Shardha Tiwari (BCA Member)\n• Jasmeet Kaur (B.Tech Member)\n• Sakshi Gupta (B.Tech Member)\n• Abhijeet Gautam (BCA Member)\n• Saiket Guha (B.Tech Member)\n\nInaugural Session Timing: 02:30 PM to 05:30 PM (Duration: 3 Hours)\nVenue: MSOET Seminar Room & IT Labs, Lucknow Campus',
        category: 'Technical',
        image: '/images/tech-sutra.jpeg',
        date: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
        startTime: '02:30 PM',
        endTime: '05:30 PM',
        duration: '3 Hours',
        venue: 'MSOET Seminar Room & IT Labs, MUIT Lucknow Campus',
        capacity: 200,
        registeredCount: 0,
        registrationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        organizer: organizer._id,
        organizerName: 'Tech-Sutra Club & MSOET',
        status: 'Registration Open'
      },
      {
        title: 'MUIT Tech Fest 2026',
        description: 'The premier annual flagship technology symposium of Maharishi University of Information Technology. Experience hackathons, robotic wars, tech project showcases, coding sprints, gaming zones, and keynote talks by industry leaders from top tech giants.',
        category: 'Technical',
        image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80',
        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // In 15 days
        startTime: '09:30 AM',
        endTime: '05:30 PM',
        venue: 'MUIT Central Auditorium & Tech Expo Hall A',
        capacity: 500,
        registeredCount: 0,
        registrationDeadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        organizer: organizer._id,
        organizerName: 'Prof. Rajesh Sharma',
        status: 'Registration Open'
      },
      {
        title: 'Hands-on Training on Generative AI (AI & Machine Learning Workshop)',
        description: 'Organised by: Maharishi School of Engineering & Technology (MSOET), Lucknow Campus in association with IQAC.\n\n"HANDS-ON TRAINING ON GENERATIVE AI"\nAn intensive industry-oriented masterclass on Generative AI, Prompt Engineering, Large Language Models (LLMs), neural architectures, and deploying production AI applications.\n\nExpert Guest Trainer:\n• Mr. Ved Prakash (DigiCoders Tech, Lucknow)\n\nKey Details:\n• Date: 24th August 2026\n• Timing: 01:30 PM onwards\n• Venue: Central Computer Lab, Maharishi University, Lucknow Campus\n• Certified Quality Standards: ISO 21001, ISO 29993, ISO 9001, ISO 14001\n\nOpen to all BCA, MCA, and B.Tech computer science and IT students. Practical coding, API keys, and hands-on laboratory exercises included!',
        category: 'Workshop',
        image: '/images/generative-ai-workshop.jpg',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        startTime: '01:30 PM',
        endTime: '05:00 PM',
        duration: '3 Hours 30 Mins',
        venue: 'Central Computer Lab, Maharishi University, Lucknow Campus',
        capacity: 120,
        registeredCount: 0,
        registrationDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        organizer: organizer._id,
        organizerName: 'MSOET & IQAC (Trainer: Mr. Ved Prakash)',
        status: 'Registration Open'
      },
      {
        title: 'MUIT Hackathon 2026',
        description: '36-hour non-stop hackathon focusing on Smart Campus, Healthcare AI, FinTech Security, and Clean Energy solutions. Build, deploy and pitch your prototype to angel investors and tech mentors. Grand cash prize pool of INR 1,50,000!',
        category: 'Competition',
        image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80',
        date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        startTime: '08:00 AM',
        endTime: '08:00 PM',
        venue: 'Innovation & Incubation Hub, MUIT Campus',
        capacity: 250,
        registeredCount: 0,
        registrationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        organizer: organizer._id,
        organizerName: 'MUIT Tech Council',
        status: 'Registration Open'
      },
      {
        title: 'Coding Competition: Code Combat 2026',
        description: 'Multi-round competitive programming clash testing algorithmic prowess, data structures, dynamic programming, and rapid debugging skills. Languages allowed: C++, Java, Python, and JavaScript.',
        category: 'Competition',
        image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
        date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        startTime: '02:00 PM',
        endTime: '05:30 PM',
        venue: 'Online & Lab 1, IT Block',
        capacity: 200,
        registeredCount: 0,
        registrationDeadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        organizer: organizer._id,
        organizerName: 'Prof. Rajesh Sharma',
        status: 'Registration Open'
      },
      {
        title: 'Cultural Fest 2026: Tarang',
        description: 'A vibrant kaleidoscope of musical harmonies, classical and western dance choreography, street theatre (Nukkad Natak), fashion parade, and live celebrity band performance under the university amphitheatre skies.',
        category: 'Cultural',
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        startTime: '04:00 PM',
        endTime: '10:00 PM',
        venue: 'MUIT Open Air Amphitheatre',
        capacity: 1200,
        registeredCount: 0,
        registrationDeadline: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000),
        organizer: organizer._id,
        organizerName: 'Cultural Committee',
        status: 'Upcoming'
      },
      {
        title: 'Sports Meet 2026: Spardha',
        description: 'The inter-departmental athletic extravaganza comprising cricket tournament, football league, badminton championships, 100m sprint, table tennis, and chess matches. Showcase your sportsmanship and team spirit.',
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&auto=format&fit=crop&q=80',
        date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        startTime: '08:30 AM',
        endTime: '06:00 PM',
        venue: 'MUIT University Sports Grounds & Indoor Complex',
        capacity: 800,
        registeredCount: 0,
        registrationDeadline: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
        organizer: organizer._id,
        organizerName: 'Sports Council',
        status: 'Upcoming'
      },
      {
        title: 'Entrepreneurship Summit 2026: E-Conclave',
        description: 'Fostering the next generation of student startup founders. Interactive panel discussions with VC partners, pitch elevator sessions, intellectual property law workshops, and case studies of successful Indian unicorns.',
        category: 'Career & Placement',
        image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&auto=format&fit=crop&q=80',
        date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        startTime: '10:00 AM',
        endTime: '04:30 PM',
        venue: 'Management Block Conference Hall',
        capacity: 300,
        registeredCount: 0,
        registrationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        organizer: organizer._id,
        organizerName: 'E-Cell MUIT',
        status: 'Registration Open'
      },
      {
        title: 'Placement Preparation Workshop',
        description: 'Comprehensive boot camp covering resume crafting, technical coding round strategies, mock interviews with HR executives from Tier-1 MNCs, and soft skills presentation mastery.',
        category: 'Career & Placement',
        image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&auto=format&fit=crop&q=80',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Past completed event
        startTime: '11:00 AM',
        endTime: '03:30 PM',
        venue: 'Seminar Hall 2, Academic Block A',
        capacity: 150,
        registeredCount: 0,
        registrationDeadline: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        organizer: organizer._id,
        organizerName: 'Training & Placement Cell',
        status: 'Completed'
      },
      {
        title: 'Cyber Security Seminar: Defending Digital Frontiers',
        description: 'Explore ethical hacking methodologies, penetration testing, defensive architecture, cloud security, and zero-day threat prevention with certified ethical hackers and cyber defense officers.',
        category: 'Seminar',
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // Past completed event
        startTime: '10:30 AM',
        endTime: '02:30 PM',
        venue: 'MUIT Audio-Visual Hall, 3rd Floor',
        capacity: 180,
        registeredCount: 0,
        registrationDeadline: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
        organizer: organizer._id,
        organizerName: 'Prof. Rajesh Sharma',
        status: 'Completed'
      },
      {
        title: 'Project Exhibition 2026',
        description: 'Annual inter-departmental capstone and research project exhibition. Students from BCA, MCA, and B.Tech present functioning web applications, IoT devices, embedded systems, and robotics to external academic evaluators.',
        category: 'Exhibition',
        image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&auto=format&fit=crop&q=80',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        startTime: '09:00 AM',
        endTime: '04:00 PM',
        venue: 'Ground Floor Atrium, Science & Technology Block',
        capacity: 400,
        registeredCount: 0,
        registrationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        organizer: organizer._id,
        organizerName: 'Academic Council',
        status: 'Registration Open'
      }
    ];

    const createdEvents = await Event.insertMany(sampleEventsData);
    console.log(`Created ${createdEvents.length} Sample Events successfully.`);

    // 3. Create Sample Registrations with Valid QR codes
    console.log('Generating Registrations and QR Codes...');

    const pastEvent1 = createdEvents.find(e => e.title.includes('Placement Preparation'));
    const pastEvent2 = createdEvents.find(e => e.title.includes('Cyber Security Seminar'));
    const upcomingEvent1 = createdEvents.find(e => e.title.includes('Tech Fest 2026'));
    const upcomingEvent2 = createdEvents.find(e => e.title.includes('AI & Machine Learning'));

    // Register Aarav (main student) for upcoming Tech Fest
    const techFestRegId = 'MUIT-REG-2026-TF001';
    const techFestQR = await generateQRCodeDataURL({
      registrationId: techFestRegId,
      studentId: student._id.toString(),
      studentName: student.name,
      eventId: upcomingEvent1._id.toString(),
      eventTitle: upcomingEvent1.title
    });

    const reg1 = await Registration.create({
      student: student._id,
      event: upcomingEvent1._id,
      registrationId: techFestRegId,
      qrCode: techFestQR,
      status: 'Registered',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });
    upcomingEvent1.registeredCount += 1;
    await upcomingEvent1.save();

    // Register Aarav for AI Workshop
    const aiWorkshopRegId = 'MUIT-REG-2026-AI002';
    const aiWorkshopQR = await generateQRCodeDataURL({
      registrationId: aiWorkshopRegId,
      studentId: student._id.toString(),
      studentName: student.name,
      eventId: upcomingEvent2._id.toString(),
      eventTitle: upcomingEvent2.title
    });

    const reg2 = await Registration.create({
      student: student._id,
      event: upcomingEvent2._id,
      registrationId: aiWorkshopRegId,
      qrCode: aiWorkshopQR,
      status: 'Registered',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });
    upcomingEvent2.registeredCount += 1;
    await upcomingEvent2.save();

    // Register Aarav for Past Event 1 (Placement Workshop) -> attended
    const placementRegId = 'MUIT-REG-2026-PL003';
    const placementQR = await generateQRCodeDataURL({
      registrationId: placementRegId,
      studentId: student._id.toString(),
      studentName: student.name,
      eventId: pastEvent1._id.toString(),
      eventTitle: pastEvent1.title
    });

    const reg3 = await Registration.create({
      student: student._id,
      event: pastEvent1._id,
      registrationId: placementRegId,
      qrCode: placementQR,
      status: 'Attended',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    });
    pastEvent1.registeredCount += 1;
    await pastEvent1.save();

    // Register Aarav for Past Event 2 (Cyber Security Seminar) -> attended
    const cyberRegId = 'MUIT-REG-2026-CS004';
    const cyberQR = await generateQRCodeDataURL({
      registrationId: cyberRegId,
      studentId: student._id.toString(),
      studentName: student.name,
      eventId: pastEvent2._id.toString(),
      eventTitle: pastEvent2.title
    });

    const reg4 = await Registration.create({
      student: student._id,
      event: pastEvent2._id,
      registrationId: cyberRegId,
      qrCode: cyberQR,
      status: 'Attended',
      createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000)
    });
    pastEvent2.registeredCount += 1;
    await pastEvent2.save();

    // Register other students for events to populate numbers
    for (const [idx, otherStudent] of [student2, student3, student4].entries()) {
      const regId = `MUIT-REG-2026-TF00${idx + 2}`;
      const qr = await generateQRCodeDataURL({
        registrationId: regId,
        studentId: otherStudent._id.toString(),
        studentName: otherStudent.name,
        eventId: upcomingEvent1._id.toString(),
        eventTitle: upcomingEvent1.title
      });

      await Registration.create({
        student: otherStudent._id,
        event: upcomingEvent1._id,
        registrationId: regId,
        qrCode: qr,
        status: 'Registered',
        createdAt: new Date(Date.now() - (idx + 1) * 24 * 60 * 60 * 1000)
      });
      upcomingEvent1.registeredCount += 1;
    }
    await upcomingEvent1.save();

    // 4. Create Sample Attendance records for attended events
    console.log('Seeding Attendance records...');

    const att1 = await Attendance.create({
      student: student._id,
      event: pastEvent1._id,
      registration: reg3._id,
      checkInTime: new Date(pastEvent1.date.getTime() + 15 * 60 * 1000), // 15 mins after start
      markedBy: organizer._id,
      status: 'Present'
    });

    const att2 = await Attendance.create({
      student: student._id,
      event: pastEvent2._id,
      registration: reg4._id,
      checkInTime: new Date(pastEvent2.date.getTime() + 20 * 60 * 1000),
      markedBy: organizer._id,
      status: 'Present'
    });

    // 5. Create Sample Certificates
    console.log('Seeding Certificates...');

    await Certificate.create({
      student: student._id,
      event: pastEvent1._id,
      certificateId: 'MUIT-CERT-2026-PL981',
      issueDate: new Date(pastEvent1.date.getTime() + 24 * 60 * 60 * 1000),
      status: 'Issued'
    });

    await Certificate.create({
      student: student._id,
      event: pastEvent2._id,
      certificateId: 'MUIT-CERT-2026-CS412',
      issueDate: new Date(pastEvent2.date.getTime() + 24 * 60 * 60 * 1000),
      status: 'Issued'
    });

    // 6. Create Sample Feedbacks
    console.log('Seeding Event Feedbacks...');

    await Feedback.create({
      student: student._id,
      event: pastEvent1._id,
      rating: 5,
      comment: 'Exceptional placement preparation session! The resume critiquing and mock interview questions gave me immense confidence for upcoming campus drives.',
      createdAt: new Date(pastEvent1.date.getTime() + 2 * 24 * 60 * 60 * 1000)
    });

    await Feedback.create({
      student: student._id,
      event: pastEvent2._id,
      rating: 5,
      comment: 'Super informative cyber security seminar. The live demonstration of penetration testing and vulnerability disclosure was world-class.',
      createdAt: new Date(pastEvent2.date.getTime() + 2 * 24 * 60 * 60 * 1000)
    });

    await Feedback.create({
      student: student2._id,
      event: pastEvent1._id,
      rating: 4,
      comment: 'Great insights into aptitude and coding round rounds. Would love a part 2 on system design!',
      createdAt: new Date(pastEvent1.date.getTime() + 3 * 24 * 60 * 60 * 1000)
    });

    console.log('====================================================');
    console.log('  MUIT Event Management System Seeding Completed!   ');
    console.log('====================================================');
    console.log('Demo Accounts:');
    console.log('  Student:   student@muit.edu   / Password123!');
    console.log('  Organizer: organizer@muit.edu / Password123!');
    console.log('  Admin:     admin@muit.edu     / Password123!');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
