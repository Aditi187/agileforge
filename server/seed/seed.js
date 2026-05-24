const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Project = require('../models/Project');
const Sprint = require('../models/Sprint');
const Issue = require('../models/Issue');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Sprint.deleteMany({}),
      Issue.deleteMany({}),
      Comment.deleteMany({}),
      Activity.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // Create Users
    const users = await User.create([
      {
        name: 'Aditi Sharma',
        email: 'aditi.sharma@gmail.com',
        password: 'Admin@123',
        role: 'admin',
        designation: 'Engineering Manager',
        avatar: 'https://ui-avatars.com/api/?name=Aditi+Sharma&background=6366f1&color=fff&bold=true'
      },
      {
        name: 'Rahul Verma',
        email: 'rahul.verma@gmail.com',
        password: 'Lead@123',
        role: 'project_lead',
        designation: 'Senior Developer',
        avatar: 'https://ui-avatars.com/api/?name=Rahul+Verma&background=8b5cf6&color=fff&bold=true'
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@gmail.com',
        password: 'Dev@123',
        role: 'developer',
        designation: 'Full Stack Developer',
        avatar: 'https://ui-avatars.com/api/?name=Priya+Patel&background=ec4899&color=fff&bold=true'
      },
      {
        name: 'Arjun Singh',
        email: 'arjun.singh@gmail.com',
        password: 'Dev@123',
        role: 'developer',
        designation: 'Frontend Developer',
        avatar: 'https://ui-avatars.com/api/?name=Arjun+Singh&background=14b8a6&color=fff&bold=true'
      },
      {
        name: 'Sneha Gupta',
        email: 'sneha.gupta@gmail.com',
        password: 'Dev@123',
        role: 'developer',
        designation: 'Backend Developer',
        avatar: 'https://ui-avatars.com/api/?name=Sneha+Gupta&background=f59e0b&color=fff&bold=true'
      },
      {
        name: 'Vikram Kumar',
        email: 'vikram.kumar@gmail.com',
        password: 'Dev@123',
        role: 'viewer',
        designation: 'QA Engineer',
        avatar: 'https://ui-avatars.com/api/?name=Vikram+Kumar&background=ef4444&color=fff&bold=true'
      }
    ]);
    console.log(`👥 Created ${users.length} users`);

    const [admin, lead, priya, arjun, sneha, vikram] = users;

    // Create Projects
    const projects = await Project.create([
      {
        name: 'E-Commerce Platform',
        key: 'ECOM',
        description: 'Building a modern e-commerce platform with React and Node.js for the manufacturing division\'s direct-to-consumer channel.',
        lead: lead._id,
        members: [admin._id, lead._id, priya._id, arjun._id, sneha._id, vikram._id],
        category: 'software',
        color: '#6366f1'
      },
      {
        name: 'Mobile App Redesign',
        key: 'MOBI',
        description: 'Complete UI/UX overhaul of the customer-facing mobile application with new design system.',
        lead: admin._id,
        members: [admin._id, lead._id, arjun._id, vikram._id],
        category: 'design',
        color: '#ec4899'
      }
    ]);
    console.log(`📁 Created ${projects.length} projects`);

    const [ecom, mobile] = projects;

    // Create Sprints for ECOM
    const sprints = await Sprint.create([
      {
        project: ecom._id,
        name: 'Sprint 1 - Foundation',
        goal: 'Set up project infrastructure, auth system, and product catalog',
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-05-14'),
        status: 'completed',
        order: 0
      },
      {
        project: ecom._id,
        name: 'Sprint 2 - Core Features',
        goal: 'Build shopping cart, checkout flow, and payment integration',
        startDate: new Date('2026-05-15'),
        endDate: new Date('2026-05-28'),
        status: 'active',
        order: 1
      },
      {
        project: ecom._id,
        name: 'Sprint 3 - Polish & Launch',
        goal: 'Performance optimization, testing, and production deployment',
        status: 'planning',
        order: 2
      },
      {
        project: mobile._id,
        name: 'Sprint 1 - Design System',
        goal: 'Create component library and design tokens',
        startDate: new Date('2026-05-10'),
        endDate: new Date('2026-05-24'),
        status: 'active',
        order: 0
      }
    ]);
    console.log(`🏃 Created ${sprints.length} sprints`);

    const [sprint1, sprint2, sprint3, mobileSprint] = sprints;

    // Create Issues for ECOM project
    const issues = await Issue.create([
      // Sprint 1 (completed) issues
      {
        project: ecom._id, sprint: sprint1._id, issueKey: 'ECOM-1',
        type: 'epic', title: 'User Authentication System', description: 'Implement complete auth flow with JWT, OAuth, and role-based access control.',
        status: 'done', priority: 'critical', assignee: sneha._id, reporter: lead._id,
        labels: ['backend', 'security'], storyPoints: 13, order: 0
      },
      {
        project: ecom._id, sprint: sprint1._id, issueKey: 'ECOM-2',
        type: 'story', title: 'User Registration Page', description: 'Create registration form with email verification and strong password validation.',
        status: 'done', priority: 'high', assignee: arjun._id, reporter: lead._id,
        labels: ['frontend', 'auth'], storyPoints: 5, order: 1
      },
      {
        project: ecom._id, sprint: sprint1._id, issueKey: 'ECOM-3',
        type: 'story', title: 'Login & Session Management', description: 'JWT-based login with refresh tokens and remember me functionality.',
        status: 'done', priority: 'high', assignee: sneha._id, reporter: lead._id,
        labels: ['backend', 'auth'], storyPoints: 8, order: 2
      },
      {
        project: ecom._id, sprint: sprint1._id, issueKey: 'ECOM-4',
        type: 'task', title: 'Setup CI/CD Pipeline', description: 'Configure GitHub Actions for automated testing and deployment.',
        status: 'done', priority: 'medium', assignee: priya._id, reporter: admin._id,
        labels: ['devops'], storyPoints: 5, order: 3
      },
      {
        project: ecom._id, sprint: sprint1._id, issueKey: 'ECOM-5',
        type: 'bug', title: 'Fix CORS headers on API', description: 'API returns CORS error when called from different origin.',
        status: 'done', priority: 'critical', assignee: sneha._id, reporter: vikram._id,
        labels: ['backend', 'bug'], storyPoints: 2, order: 4
      },

      // Sprint 2 (active) issues
      {
        project: ecom._id, sprint: sprint2._id, issueKey: 'ECOM-6',
        type: 'epic', title: 'Shopping Cart & Checkout', description: 'Complete shopping cart functionality with multi-step checkout process.',
        status: 'inprogress', priority: 'critical', assignee: priya._id, reporter: lead._id,
        labels: ['fullstack', 'core'], storyPoints: 21, order: 0
      },
      {
        project: ecom._id, sprint: sprint2._id, issueKey: 'ECOM-7',
        type: 'story', title: 'Product Cart Management', description: 'Add to cart, remove, update quantity, persist cart state across sessions.',
        status: 'inreview', priority: 'high', assignee: arjun._id, reporter: lead._id,
        labels: ['frontend'], storyPoints: 8, order: 1
      },
      {
        project: ecom._id, sprint: sprint2._id, issueKey: 'ECOM-8',
        type: 'story', title: 'Checkout Flow UI', description: 'Multi-step checkout: Shipping → Payment → Review → Confirmation.',
        status: 'inprogress', priority: 'high', assignee: arjun._id, reporter: lead._id,
        labels: ['frontend', 'ux'], storyPoints: 8, order: 2
      },
      {
        project: ecom._id, sprint: sprint2._id, issueKey: 'ECOM-9',
        type: 'task', title: 'Payment Gateway Integration', description: 'Integrate Razorpay for INR payments with webhook handling.',
        status: 'todo', priority: 'critical', assignee: sneha._id, reporter: lead._id,
        labels: ['backend', 'payments'], storyPoints: 13, order: 3
      },
      {
        project: ecom._id, sprint: sprint2._id, issueKey: 'ECOM-10',
        type: 'story', title: 'Order History Page', description: 'Display order history with status tracking, filters, and order detail view.',
        status: 'todo', priority: 'medium', assignee: priya._id, reporter: lead._id,
        labels: ['fullstack'], storyPoints: 5, order: 4
      },
      {
        project: ecom._id, sprint: sprint2._id, issueKey: 'ECOM-11',
        type: 'bug', title: 'Product images not loading on Safari', description: 'WebP images fail to render on Safari 14. Need fallback formats.',
        status: 'todo', priority: 'high', assignee: arjun._id, reporter: vikram._id,
        labels: ['frontend', 'bug', 'browser-compat'], storyPoints: 3, order: 5
      },
      {
        project: ecom._id, sprint: sprint2._id, issueKey: 'ECOM-12',
        type: 'task', title: 'Write E2E Tests for Cart', description: 'Cypress tests for add to cart, update quantity, remove, and checkout flow.',
        status: 'backlog', priority: 'medium', assignee: vikram._id, reporter: admin._id,
        labels: ['testing', 'qa'], storyPoints: 5, order: 6
      },

      // Backlog issues (no sprint)
      {
        project: ecom._id, sprint: null, issueKey: 'ECOM-13',
        type: 'story', title: 'Product Search with Elasticsearch', description: 'Implement full-text search with filters, facets, and autocomplete suggestions.',
        status: 'backlog', priority: 'medium', assignee: null, reporter: lead._id,
        labels: ['backend', 'search'], storyPoints: 13, order: 0
      },
      {
        project: ecom._id, sprint: null, issueKey: 'ECOM-14',
        type: 'story', title: 'Wishlist Feature', description: 'Allow users to save products to wishlist and share via link.',
        status: 'backlog', priority: 'low', assignee: null, reporter: priya._id,
        labels: ['fullstack'], storyPoints: 5, order: 1
      },
      {
        project: ecom._id, sprint: null, issueKey: 'ECOM-15',
        type: 'epic', title: 'Analytics Dashboard', description: 'Admin analytics: sales trends, user behavior, conversion funnels, top products.',
        status: 'backlog', priority: 'medium', assignee: null, reporter: admin._id,
        labels: ['fullstack', 'analytics'], storyPoints: 21, order: 2
      },
      {
        project: ecom._id, sprint: null, issueKey: 'ECOM-16',
        type: 'task', title: 'SEO Optimization', description: 'Implement SSR meta tags, sitemap, structured data for products.',
        status: 'backlog', priority: 'low', assignee: null, reporter: lead._id,
        labels: ['frontend', 'seo'], storyPoints: 8, order: 3
      },
      {
        project: ecom._id, sprint: null, issueKey: 'ECOM-17',
        type: 'bug', title: 'Memory leak in product listing', description: 'Product listing page leaks memory when rapidly paginating. Investigate useEffect cleanup.',
        status: 'backlog', priority: 'high', assignee: null, reporter: vikram._id,
        labels: ['frontend', 'performance', 'bug'], storyPoints: 5, order: 4
      },

      // Mobile project issues
      {
        project: mobile._id, sprint: mobileSprint._id, issueKey: 'MOBI-1',
        type: 'epic', title: 'Design System Foundation', description: 'Create foundational design tokens, color palette, typography scale, and spacing system.',
        status: 'inprogress', priority: 'critical', assignee: arjun._id, reporter: admin._id,
        labels: ['design', 'ui'], storyPoints: 13, order: 0
      },
      {
        project: mobile._id, sprint: mobileSprint._id, issueKey: 'MOBI-2',
        type: 'story', title: 'Component Library - Buttons', description: 'Design and implement all button variants: primary, secondary, ghost, destructive.',
        status: 'done', priority: 'high', assignee: arjun._id, reporter: admin._id,
        labels: ['design', 'components'], storyPoints: 5, order: 1
      },
      {
        project: mobile._id, sprint: mobileSprint._id, issueKey: 'MOBI-3',
        type: 'story', title: 'Component Library - Forms', description: 'Input fields, select dropdowns, checkboxes, radio buttons, and form validation.',
        status: 'inprogress', priority: 'high', assignee: arjun._id, reporter: admin._id,
        labels: ['design', 'components'], storyPoints: 8, order: 2
      },
      {
        project: mobile._id, sprint: mobileSprint._id, issueKey: 'MOBI-4',
        type: 'task', title: 'Setup Storybook for Components', description: 'Configure Storybook for isolated component development and documentation.',
        status: 'todo', priority: 'medium', assignee: lead._id, reporter: admin._id,
        labels: ['devops', 'documentation'], storyPoints: 3, order: 3
      }
    ]);
    console.log(`📋 Created ${issues.length} issues`);

    // Create Comments
    const comments = await Comment.create([
      {
        issue: issues[6]._id, author: lead._id,
        body: 'Great progress on the cart management! The persistent state approach using localStorage is solid. Just need to handle the edge case when items go out of stock while in cart.'
      },
      {
        issue: issues[6]._id, author: arjun._id,
        body: 'Good point @Rahul. I\'ll add a stock validation step that runs when the cart page loads and before checkout. Will push the update today.'
      },
      {
        issue: issues[7]._id, author: priya._id,
        body: 'The checkout flow wireframes look great. Should we add a guest checkout option for users who don\'t want to create an account?'
      },
      {
        issue: issues[7]._id, author: lead._id,
        body: 'Yes, let\'s add guest checkout. It significantly improves conversion rates. Create a separate task for it.'
      },
      {
        issue: issues[8]._id, author: sneha._id,
        body: 'I\'ve set up the Razorpay test environment. API keys are in the .env file. The webhook endpoint is ready for testing.'
      },
      {
        issue: issues[5]._id, author: admin._id,
        body: 'This epic is critical for our Q2 launch. Let\'s make sure we have daily standups to track progress on all related stories.'
      }
    ]);
    console.log(`💬 Created ${comments.length} comments`);

    // Create Activities
    const activities = await Activity.create([
      { project: ecom._id, issue: issues[5]._id, user: priya._id, action: 'updated_status', details: 'Moved "Shopping Cart & Checkout" from todo to inprogress', metadata: { from: 'todo', to: 'inprogress' } },
      { project: ecom._id, issue: issues[6]._id, user: arjun._id, action: 'updated_status', details: 'Moved "Product Cart Management" from inprogress to inreview', metadata: { from: 'inprogress', to: 'inreview' } },
      { project: ecom._id, user: lead._id, action: 'started_sprint', details: 'Started sprint "Sprint 2 - Core Features"' },
      { project: ecom._id, user: lead._id, action: 'completed_sprint', details: 'Completed sprint "Sprint 1 - Foundation"' },
      { project: ecom._id, issue: issues[10]._id, user: vikram._id, action: 'created_issue', details: 'Created bug "Product images not loading on Safari"' },
      { project: ecom._id, issue: issues[6]._id, user: lead._id, action: 'added_comment', details: 'Commented on "Product Cart Management"' },
      { project: mobile._id, issue: issues[18]._id, user: arjun._id, action: 'updated_status', details: 'Moved "Component Library - Buttons" from inprogress to done', metadata: { from: 'inprogress', to: 'done' } },
      { project: mobile._id, user: admin._id, action: 'created_project', details: 'Created project "Mobile App Redesign"' },
      { project: ecom._id, issue: issues[8]._id, user: sneha._id, action: 'added_comment', details: 'Commented on "Payment Gateway Integration"' },
      { project: ecom._id, issue: issues[7]._id, user: arjun._id, action: 'updated_status', details: 'Moved "Checkout Flow UI" from todo to inprogress', metadata: { from: 'todo', to: 'inprogress' } }
    ]);
    console.log(`📊 Created ${activities.length} activities`);

    console.log('\n✨ Database seeded successfully!\n');
    console.log('Demo Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:        aditi.sharma@gmail.com / Admin@123');
    console.log('Project Lead: rahul.verma@gmail.com / Lead@123');
    console.log('Developer:    priya.patel@gmail.com / Dev@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDB();
