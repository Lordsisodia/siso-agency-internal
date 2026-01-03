import { Trophy, Calendar, MessageSquare, Heart, GraduationCap, Wrench, Bot, Share2, Award, Star, Newspaper, Users, Coins } from 'lucide-react';
import { EarningSection } from '@/types/earning';

export const earningSections: EarningSection[] = [
  {
    title: "Daily Engagement",
    icon: Calendar,
    description: "Regular platform activities and streaks.",
    items: [
      { 
        action: "Daily Login",
        points: "5 points",
        cooldown_minutes: 1440,
        requirements: {
          description: "Simply log into your account once every 24 hours. The timer resets at midnight UTC."
        }
      },
      { 
        action: "7-Day Login Streak",
        points: "50 points bonus",
        requirements: {
          description: "Log in for 7 consecutive days. Missing a day will reset your streak to 0."
        }
      },
      { 
        action: "30-Day Login Streak",
        points: "250 points bonus",
        requirements: {
          description: "Maintain your login streak for 30 consecutive days for a major bonus."
        }
      },
      { 
        action: "Read News Article",
        points: "5 points",
        cooldown_minutes: 60,
        requirements: {
          description: "Read an article for at least 1 minute. You can earn points for up to 10 different articles per day."
        }
      },
      { 
        action: "News Comment",
        points: "5 points",
        cooldown_minutes: 60,
        requirements: {
          description: "Leave a meaningful comment of at least 20 characters on any news article."
        }
      },
      { 
        action: "Use Tool",
        points: "5 points",
        cooldown_minutes: 120,
        requirements: {
          description: "Try out any tool from our directory. Points are awarded for unique tool interactions."
        }
      }
    ]
  },
  {
    title: "Content & Learning",
    icon: MessageSquare,
    description: "Create, share, and learn from content.",
    items: [
      { 
        action: "Write Article",
        points: "50 points",
        cooldown_minutes: 1440,
        requirements: {
          description: "Submit an original article of at least 500 words. Must be approved by moderators.",
          minimum_words: 500,
          requires_approval: true
        }
      },
      { 
        action: "Create Tutorial",
        points: "100 points",
        cooldown_minutes: 2880,
        requirements: {
          description: "Create and publish a detailed tutorial with steps and examples. Minimum 1000 words.",
          minimum_words: 1000,
          requires_approval: true
        }
      },
      { 
        action: "Share Workflow",
        points: "25 points",
        cooldown_minutes: 1440,
        requirements: {
          description: "Document and share your workflow using our tools. Include screenshots or video."
        }
      },
      { 
        action: "Watch Tutorial",
        points: "10 points",
        cooldown_minutes: 240,
        requirements: {
          description: "Watch an educational tutorial for at least 5 minutes to earn points."
        }
      },
      { 
        action: "Complete Course",
        points: "50 points",
        requirements: {
          description: "Finish all modules in a course and pass the final assessment."
        }
      },
      { 
        action: "Pass Assessment",
        points: "25 points",
        cooldown_minutes: 1440,
        requirements: {
          description: "Score at least 80% on a skill assessment test."
        }
      }
    ]
  },
  {
    title: "Community Building",
    icon: Users,
    description: "Grow and engage with the community.",
    items: [
      { 
        action: "Comment on Article",
        points: "5 points",
        cooldown_minutes: 60,
        requirements: {
          description: "Leave thoughtful comments of at least 30 characters on articles.",
          minimum_length: 30
        }
      },
      { 
        action: "Network Reply",
        points: "5 points",
        cooldown_minutes: 30,
        requirements: {
          description: "Respond to community discussions with helpful information."
        }
      },
      { 
        action: "Network Discussion",
        points: "10 points",
        cooldown_minutes: 120,
        requirements: {
          description: "Start a new discussion thread in the community forum."
        }
      },
      { 
        action: "Host Event",
        points: "100 points",
        requirements: {
          description: "Organize and host a community event or workshop. Must be pre-approved.",
          requires_approval: true
        }
      },
      { 
        action: "Social Media Post",
        points: "5 points",
        cooldown_minutes: 360,
        requirements: {
          description: "Share SISO content on Twitter, LinkedIn, or other platforms with our hashtag."
        }
      },
      { 
        action: "Successful Referral",
        points: "100 points",
        requirements: {
          description: "Invite a new user who completes their profile and earns their first 50 points."
        }
      }
    ]
  },
  {
    title: "AI & Tools",
    icon: Bot,
    description: "Contribute to AI and tool development.",
    items: [
      { 
        action: "Train Assistant",
        points: "15 points",
        cooldown_minutes: 180,
        requirements: {
          description: "Help train our AI by providing feedback and corrections on responses."
        }
      },
      { 
        action: "Assistant Feedback",
        points: "5 points",
        cooldown_minutes: 60,
        requirements: {
          description: "Rate and provide detailed feedback on AI assistant interactions."
        }
      },
      { 
        action: "AI Model Testing",
        points: "20 points",
        cooldown_minutes: 240,
        requirements: {
          description: "Participate in testing new AI models and features. Minimum 10 test cases."
        }
      },
      { 
        action: "Tool Review",
        points: "10 points",
        cooldown_minutes: 1440,
        requirements: {
          description: "Write a detailed review of at least 100 words for any tool in our directory."
        }
      },
      { 
        action: "Tool Integration",
        points: "25 points",
        requirements: {
          description: "Successfully integrate and demonstrate use of our tools in your workflow."
        }
      },
      { 
        action: "Submit Tool",
        points: "75 points",
        requirements: {
          description: "Submit a new tool to our directory with complete documentation.",
          requires_approval: true
        }
      }
    ]
  },
  {
    title: "Expert Achievements",
    icon: Award,
    description: "Recognition and special accomplishments.",
    items: [
      { 
        action: "Become Verified Expert",
        points: "500 points",
        requirements: {
          description: "Complete expert verification process including skill assessments and portfolio review.",
          requires_approval: true
        }
      },
      { 
        action: "Expert Answer",
        points: "25 points",
        cooldown_minutes: 120,
        requirements: {
          description: "Provide a detailed, verified solution to a community question."
        }
      },
      { 
        action: "Complete Challenge",
        points: "25-100 points",
        requirements: {
          description: "Complete special challenges that test your skills. Points vary by difficulty."
        }
      },
      { 
        action: "Beta Testing",
        points: "50 points",
        requirements: {
          description: "Participate in beta testing new features and provide detailed feedback."
        }
      },
      { 
        action: "Bug Report",
        points: "15 points",
        cooldown_minutes: 1440,
        requirements: {
          description: "Submit a verified bug report with steps to reproduce and relevant screenshots."
        }
      }
    ]
  },
  {
    title: "Web3 Integration",
    icon: Coins,
    description: "Engage with crypto and NFT features.",
    items: [
      { 
        action: "First NFT Purchase",
        points: "200 points",
        requirements: {
          description: "Purchase your first SISO NFT from our collection. One-time bonus."
        }
      },
      { 
        action: "Connect Wallet",
        points: "50 points",
        requirements: {
          description: "Connect and verify your Web3 wallet to your account. One-time bonus."
        }
      },
      { 
        action: "Token Holder Bonus",
        points: "25 points/week",
        requirements: {
          description: "Hold SISO tokens in your connected wallet to earn weekly bonus points."
        }
      }
    ]
  }
];
