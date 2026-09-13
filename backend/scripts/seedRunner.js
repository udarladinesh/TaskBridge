const User = require('../models/User');
const Task = require('../models/Task');
const Rating = require('../models/Rating');
const Report = require('../models/Report');
const Transaction = require('../models/Transaction');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

const seedRunner = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Task.deleteMany();
    await Rating.deleteMany();
    await Report.deleteMany();
    await Transaction.deleteMany();
    await Message.deleteMany();
    await Notification.deleteMany();

    // Create Admin User
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      bio: 'Platform safety and dispute resolution administrator.',
      profileImage: 'https://ui-avatars.com/api/?background=ef4444&color=fff&size=128&name=Admin',
      walletBalance: 0,
      escrowBalance: 0
    });


    // Create 10 Normal Users
    const usersData = [
      { name: 'Dinesh Kumar', email: 'dinesh@example.com', bio: 'Frequent requester looking for local store product checks in Andhra Pradesh.', walletBalance: 4700, escrowBalance: 300 },
      { name: 'Priya Sharma', email: 'priya@example.com', bio: 'Vijayawada local willing to do photo collection and document pickups.', walletBalance: 6200, escrowBalance: 0 },
      { name: 'Ramesh Varma', email: 'ramesh@example.com', bio: 'Tech enthusiast and active tasker in Hyderabad and Guntur.', walletBalance: 5350, escrowBalance: 350 },
      { name: 'Ananya Reddy', email: 'ananya@example.com', bio: 'College student assisting with university info verification and local tasks.', walletBalance: 5800, escrowBalance: 0 },
      { name: 'Rajesh Gupta', email: 'rajesh@example.com', bio: 'Small business owner needing physical location verifications.', walletBalance: 4600, escrowBalance: 400 },
      { name: 'Sunita Rao', email: 'sunita@example.com', bio: 'Freelancer available in Visakhapatnam for store inspections.', walletBalance: 6400, escrowBalance: 0 },
      { name: 'Vikram Singh', email: 'vikram@example.com', bio: 'Bengaluru based professional available for weekend verifications.', walletBalance: 5000, escrowBalance: 0 },
      { name: 'Kavya Nair', email: 'kavya@example.com', bio: 'Chennai resident assisting with local venue photography.', walletBalance: 4750, escrowBalance: 250 },
      { name: 'Suresh Babu', email: 'suresh@example.com', bio: 'Active community worker in Vijayawada.', walletBalance: 5500, escrowBalance: 0 },
      { name: 'Meena Joshi', email: 'meena@example.com', bio: 'Photographer and verifier operating in Mumbai.', walletBalance: 4650, escrowBalance: 350 }
    ];

    const users = [];
    for (const u of usersData) {
      const created = await User.create({
        ...u,
        password: 'password123',
        profileImage: `https://ui-avatars.com/api/?background=6366f1&color=fff&size=128&name=${encodeURIComponent(u.name)}`
      });
      users.push(created);
    }

    const [dinesh, priya, ramesh, ananya, rajesh, sunita, vikram, kavya, suresh, meena] = users;

    const futureDate = (daysAhead, hoursAhead = 0) => {
      const d = new Date();
      d.setDate(d.getDate() + daysAhead);
      d.setHours(d.getHours() + hoursAhead);
      return d;
    };

    const pastDate = (daysAgo) => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return d;
    };

    const tasksData = [
      {
        title: 'Verify Dell XPS 15 availability at Vijayawada shop',
        description: 'Need someone to visit Lotus Electronics near Benz Circle, Vijayawada to confirm if they have the Dell XPS 15 (16GB RAM model) in stock and check their current store offer price.',
        category: 'verification',
        location: { country: 'India', state: 'Andhra Pradesh', city: 'Vijayawada', locality: 'Benz Circle', additionalDetails: 'Opposite Trendset Mall' },
        deadline: futureDate(3, 4),
        rewardAmount: 300,
        currency: 'INR',
        proofRequirement: 'photo',
        proofInstructions: 'Take a clear photo of the store display and the price quotation slip.',
        status: 'OPEN',
        escrowStatus: 'HELD',
        requester: dinesh._id
      },
      {
        title: 'Collect public bus timetable from Vijayawada Pandit Nehru Bus Station',
        description: 'Need the latest printed bus timetable for night buses from Vijayawada to Visakhapatnam posted on the main inquiry counter at PNBS.',
        category: 'information_collection',
        location: { country: 'India', state: 'Andhra Pradesh', city: 'Vijayawada', locality: 'PNBS Busstand', additionalDetails: 'Platform 1 inquiry booth' },
        deadline: futureDate(2),
        rewardAmount: 250,
        currency: 'INR',
        proofRequirement: 'photo',
        proofInstructions: 'Photograph the official timetable board at the counter clearly displaying departure timings.',
        status: 'ACCEPTED',
        escrowStatus: 'HELD',
        requester: dinesh._id,
        tasker: priya._id,
        acceptedAt: pastDate(1)
      },
      {
        title: 'Check operational status of Sri Kanya Hotel in Visakhapatnam',
        description: 'Planning a family function. Need someone to visit Sri Kanya Hotel near Dwaraka Nagar and check if the banquet hall is currently open for bookings and take exterior photos.',
        category: 'inspection',
        location: { country: 'India', state: 'Andhra Pradesh', city: 'Visakhapatnam', locality: 'Dwaraka Nagar', additionalDetails: 'Main Road, 4th Lane' },
        deadline: futureDate(4),
        rewardAmount: 400,
        currency: 'INR',
        proofRequirement: 'photo',
        proofInstructions: 'Photos of the building facade, reception entrance, and written venue manager contact note.',
        status: 'IN_PROGRESS',
        escrowStatus: 'HELD',
        requester: rajesh._id,
        tasker: sunita._id,
        acceptedAt: pastDate(2),
        startedAt: pastDate(1)
      },
      {
        title: 'Verify secondhand camera lens condition at Gachibowli store',
        description: 'Checking whether CameraCare Gachibowli has a Canon 50mm f/1.8 STM lens in stock and inspect if front glass is scratch-free.',
        category: 'verification',
        location: { country: 'India', state: 'Telangana', city: 'Hyderabad', locality: 'Gachibowli', additionalDetails: 'Near DLF Cybercity Gate 2' },
        deadline: futureDate(1),
        rewardAmount: 350,
        currency: 'INR',
        proofRequirement: 'multiple',
        proofInstructions: '2 photos of the lens and a text summary of physical condition.',
        status: 'SUBMITTED',
        escrowStatus: 'HELD',
        requester: ramesh._id,
        tasker: ananya._id,
        acceptedAt: pastDate(2),
        startedAt: pastDate(1),
        submission: {
          submittedAt: pastDate(0.5),
          description: 'Visited CameraCare Gachibowli. Lens is in excellent condition with clear optical element and original cap included.',
          proofFiles: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80']
        },
        aiProofVerification: {
          verifiedAt: pastDate(0.4),
          matchScore: 88,
          confidence: 'HIGH',
          recommendation: 'RECOMMEND_APPROVE',
          findings: [
            '✓ Uploaded media file matching photo requirement.',
            '✓ Comprehensive completion notes provided by tasker.',
            '✓ Completion notes reference task specifics (cameracare, gachibowli).'
          ],
          summary: 'Strong evidence match. Uploaded proof meets task instructions.'
        }
      },
      {
        title: 'Verify hall ticket submission box at Andhra University campus',
        description: 'Verify whether the distance education desk at AU Administrative Block has opened the physical drop box for supplementary hall tickets.',
        category: 'verification',
        location: { country: 'India', state: 'Andhra Pradesh', city: 'Visakhapatnam', locality: 'AU Campus', additionalDetails: 'Distance Education Building' },
        deadline: pastDate(1),
        rewardAmount: 200,
        currency: 'INR',
        proofRequirement: 'photo',
        proofInstructions: 'Photo of the notice board and drop box area.',
        status: 'COMPLETED',
        escrowStatus: 'RELEASED',
        requester: ananya._id,
        tasker: sunita._id,
        acceptedAt: pastDate(5),
        startedAt: pastDate(4),
        completedAt: pastDate(3),
        submission: {
          submittedAt: pastDate(4),
          description: 'Visited AU Campus. Drop box is active and notice board confirms submissions are open till 5 PM.',
          proofFiles: ['https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80']
        },
        aiProofVerification: {
          verifiedAt: pastDate(3.9),
          matchScore: 92,
          confidence: 'HIGH',
          recommendation: 'RECOMMEND_APPROVE',
          findings: [
            '✓ Uploaded visual proof matching photo requirement.',
            '✓ Clear textual verification notes included.',
            '✓ Matches location and notice board guidelines.'
          ],
          summary: 'High confidence verification. Complies with requirements.'
        }
      },
      {
        title: 'Take high-res photos of newly opened park in Benz Circle area',
        description: 'Need clear photos of the main entry gate, walking track, and lighting facilities at the newly constructed public park near Benz Circle.',
        category: 'photo_collection',
        location: { country: 'India', state: 'Andhra Pradesh', city: 'Vijayawada', locality: 'Benz Circle', additionalDetails: 'Near Municipal Water Tank' },
        deadline: pastDate(2),
        rewardAmount: 500,
        currency: 'INR',
        proofRequirement: 'photo',
        proofInstructions: 'At least 3 photos showing park amenities and daytime entry hours board.',
        status: 'COMPLETED',
        escrowStatus: 'RELEASED',
        requester: dinesh._id,
        tasker: suresh._id,
        acceptedAt: pastDate(6),
        startedAt: pastDate(5),
        completedAt: pastDate(4),
        submission: {
          submittedAt: pastDate(4.5),
          description: 'Photos taken during morning hours. Park is well-maintained and open daily 5 AM to 8 PM.',
          proofFiles: ['https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=600&q=80']
        }
      }
    ];

    const tasks = await Task.insertMany(tasksData);

    // Seed Sample Messages for task in progress / submitted
    const submittedTask = tasks.find(t => t.status === 'SUBMITTED');
    if (submittedTask) {
      await Message.create({
        task: submittedTask._id,
        sender: ramesh._id,
        recipient: ananya._id,
        text: 'Hi Ananya, please check if the lens cap is the original Canon pinch-style one.',
        createdAt: pastDate(1.5)
      });
      await Message.create({
        task: submittedTask._id,
        sender: ananya._id,
        recipient: ramesh._id,
        text: 'Yes Ramesh! I have checked and photographed it with the original cap on.',
        createdAt: pastDate(1.2)
      });
      await Message.create({
        task: submittedTask._id,
        sender: ananya._id,
        recipient: ramesh._id,
        text: 'Just uploaded the proof photos for your approval!',
        createdAt: pastDate(0.5)
      });
    }

    // Seed Sample Notifications
    await Notification.create({
      user: ramesh._id,
      actor: ananya._id,
      task: submittedTask?._id,
      type: 'TASK_SUBMITTED',
      title: 'Proof Submitted for Review',
      message: 'Ananya Reddy has submitted completion proof for your camera lens verification task.',
      link: `/tasks/${submittedTask?._id}`,
      createdAt: pastDate(0.5)
    });

    await Notification.create({
      user: priya._id,
      actor: dinesh._id,
      task: tasks[1]._id,
      type: 'TASK_ACCEPTED',
      title: 'Task Assigned',
      message: 'You have accepted Dinesh\'s task at Vijayawada PNBS Bus Station.',
      link: `/tasks/${tasks[1]._id}`,
      createdAt: pastDate(1)
    });

    // Seed Sample Transactions
    await Transaction.create({
      user: dinesh._id,
      task: tasks[0]._id,
      type: 'ESCROW_HOLD',
      amount: -300,
      balanceAfter: 4700,
      description: 'Escrow locked for task "Verify Dell XPS 15 availability at Vijayawada shop"',
      createdAt: pastDate(2)
    });

    await Transaction.create({
      user: sunita._id,
      task: tasks[4]._id,
      type: 'ESCROW_RELEASE',
      amount: 200,
      balanceAfter: 6400,
      description: 'Task reward earned for completing "Verify hall ticket submission box at Andhra University campus"',
      createdAt: pastDate(3)
    });

    // Seed Ratings
    const completedTask1 = tasks.find((t) => t.status === 'COMPLETED' && t.title.includes('Andhra University'));
    if (completedTask1) {
      await Rating.create({
        task: completedTask1._id,
        fromUser: completedTask1.requester,
        toUser: completedTask1.tasker,
        rating: 5,
        comment: 'Excellent work! Sunita visited the campus promptly and sent clear photos.'
      });
      await Rating.create({
        task: completedTask1._id,
        fromUser: completedTask1.tasker,
        toUser: completedTask1.requester,
        rating: 5,
        comment: 'Very clear instructions and immediate approval after submission. Great requester!'
      });
    }

    console.log('Database Seeded Successfully with Phase 2 Features!');
    return true;
  } catch (err) {
    console.error('Seed Runner Error:', err.message);
    throw err;
  }
};

module.exports = seedRunner;
