export interface AppData {
  id: string;
  name: string;
  version: string;
  description: string;
  category: 'System' | 'Development' | 'Security' | 'Automation';
  categoryLabel: string;
  isFree: boolean;
  price: string;
  rating: number;
  downloads: string;
  updateDate: string;
  iconType: 'terminal' | 'shield' | 'code' | 'zap' | 'cpu';
  tags: string[];
}

export interface ArticleData {
  id: string;
  title: string;
  summary: string;
  category: 'Lập trình' | 'Bảo mật' | 'DevOps' | 'Hệ điều hành';
  author: string;
  date: string;
  readTime: string;
  views: string;
  iconType: 'react' | 'linux' | 'lock' | 'cloud' | 'terminal';
}

export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: 'Themes' | 'Plugins' | 'Tools' | 'Extensions';
  categoryLabel: string;
  rating: number;
  reviews: number;
  downloads: string;
  seller: string;
  badge: 'Đặc biệt' | 'Phổ biến' | 'Mới' | '';
  iconType: 'palette' | 'puzzle' | 'wrench' | 'plug';
  cover?: string;
  screenshots?: string[];
  tags?: string[];
}

export interface CommunityThread {
  id: string;
  title: string;
  content: string;
  author: string;
  role: 'Administrator' | 'Developer' | 'VIP Member' | 'Active Member';
  avatarSeed: string;
  category: 'Thảo luận' | 'Hỏi đáp' | 'Showcase' | 'Góp ý';
  replies: number;
  likes: number;
  timeAgo: string;
  isPinned?: boolean;
}

export interface DocSection {
  id: string;
  title: string;
  items: { id: string; title: string; content: string }[];
}

export interface MemberData {
  id: string;
  name: string;
  role: string;
  avatarSeed: string;
  rank: 'Vàng' | 'Bạch Kim' | 'Kim Cương' | 'Huyền Thoại';
  contributions: number;
  email?: string;
  status?: 'Active' | 'Banned';
}

// ---------------- MOCK DATA IMPLEMENTATIONS ----------------

export const appsData: AppData[] = [
  {
    id: 'sn-shell',
    name: 'SN Terminal Pro',
    version: 'v2.4.1',
    description: 'Trình giả lập terminal tối tân với hiệu năng GPU cao, tích hợp AI autocomplete và giao diện tab linh hoạt cho lập trình viên.',
    category: 'System',
    categoryLabel: 'Hệ thống',
    isFree: true,
    price: '0đ',
    rating: 4.9,
    downloads: '8.4K',
    updateDate: '24/06/2026',
    iconType: 'terminal',
    tags: ['GPU Accelerated', 'AI Assistant', 'Cross Platform']
  },
  {
    id: 'sn-guardian',
    name: 'SN Guardian Shield',
    version: 'v1.8.0',
    description: 'Hệ thống quét mã độc thời gian thực, phát hiện xâm nhập cổng mạng và bảo mật tài sản số toàn diện cho máy chủ doanh nghiệp.',
    category: 'Security',
    categoryLabel: 'Bảo mật',
    isFree: false,
    price: '350.000đ',
    rating: 4.8,
    downloads: '3.2K',
    updateDate: '12/06/2026',
    iconType: 'shield',
    tags: ['Real-time Scan', 'Network Monitor', 'Zero-Trust']
  },
  {
    id: 'sn-builder',
    name: 'SN Code Compiler',
    version: 'v3.1.2',
    description: 'Bộ công cụ đóng gói và tối ưu hóa mã nguồn siêu tốc, thay thế trực tiếp webpack/esbuild với hiệu năng tốt hơn tới 40%.',
    category: 'Development',
    categoryLabel: 'Phát triển',
    isFree: true,
    price: '0đ',
    rating: 4.7,
    downloads: '12.8K',
    updateDate: '01/07/2026',
    iconType: 'code',
    tags: ['Build Tool', 'Fast Compiling', 'Rust Powered']
  },
  {
    id: 'sn-flow',
    name: 'SN Flow Automation',
    version: 'v2.0.0',
    description: 'Nền tảng tự động hóa quy trình nghiệp vụ thông minh, kết nối APIs và quản lý tác vụ nền không cần viết mã.',
    category: 'Automation',
    categoryLabel: 'Tự động hóa',
    isFree: false,
    price: '590.000đ',
    rating: 4.9,
    downloads: '2.1K',
    updateDate: '28/05/2026',
    iconType: 'zap',
    tags: ['No-Code Workflow', 'API Integrations', 'Cron Tasks']
  },
  {
    id: 'sn-kernel-tuner',
    name: 'SN Kernel Tuner',
    version: 'v1.1.5',
    description: 'Quản lý xung nhịp CPU, giải phóng RAM thông minh và tối ưu hóa hệ điều hành Windows/Linux cho các tác vụ tải nặng.',
    category: 'System',
    categoryLabel: 'Hệ thống',
    isFree: true,
    price: '0đ',
    rating: 4.6,
    downloads: '6.7K',
    updateDate: '15/06/2026',
    iconType: 'cpu',
    tags: ['OS Optimization', 'RAM Cleaner', 'CPU Governor']
  }
];

export const articlesData: ArticleData[] = [
  {
    id: 'art-react-perf',
    title: 'Tối ưu hiệu năng ứng dụng React quy mô lớn năm 2026',
    summary: 'Phân tích các kỹ thuật quản lý state phức tạp, lập lịch render với Concurrent Features mới và giảm thiểu bundle size cực hạn.',
    category: 'Lập trình',
    author: 'Sơn Nguyễn',
    date: '28/06/2026',
    readTime: '8 phút đọc',
    views: '1.2K lượt xem',
    iconType: 'react'
  },
  {
    id: 'art-linux-hardening',
    title: 'Hướng dẫn Hardening hệ điều hành Linux bảo mật tuyệt đối',
    summary: 'Cách cấu hình SELinux, cấu hình iptables/nftables nâng cao và vô hiệu hóa các tiến trình thừa nhằm chống lại các cuộc tấn công DDoS.',
    category: 'Bảo mật',
    author: 'Admin SN',
    date: '20/06/2026',
    readTime: '12 phút đọc',
    views: '840 lượt xem',
    iconType: 'linux'
  },
  {
    id: 'art-k8s-devops',
    title: 'Kubernetes Multi-Cluster: Quản lý hạ tầng phân tán hiệu quả',
    summary: 'Kiến trúc tối ưu để đồng bộ cấu hình giữa nhiều cluster khác nhau sử dụng ArgoCD và giám sát tập trung bằng Prometheus/Grafana.',
    category: 'DevOps',
    author: 'Dương Trần',
    date: '15/06/2026',
    readTime: '15 phút đọc',
    views: '1.5K lượt xem',
    iconType: 'cloud'
  },
  {
    id: 'art-rust-terminal',
    title: 'Xây dựng CLI ứng dụng tốc độ cao bằng Rust',
    summary: 'Tại sao Rust là ngôn ngữ số một cho các công cụ dòng lệnh (CLI)? Hướng dẫn sử dụng clap, tokio để viết các phần mềm đa luồng.',
    category: 'Lập trình',
    author: 'Khánh Lê',
    date: '02/06/2026',
    readTime: '10 phút đọc',
    views: '930 lượt xem',
    iconType: 'terminal'
  }
];

export const marketplaceData: MarketplaceItem[] = [
  {
    id: 'market-theme-cyber',
    name: 'Cyberpunk Red Neon Theme',
    description: 'Chủ đề màu sắc cực chất phong cách Neon Cyberpunk dành cho SN Terminal và VS Code.',
    price: '99.000đ',
    category: 'Themes',
    categoryLabel: 'Giao diện',
    rating: 4.9,
    reviews: 142,
    downloads: '1.8K',
    seller: 'SN Design Team',
    badge: 'Phổ biến',
    iconType: 'palette'
  },
  {
    id: 'market-plug-git',
    name: 'Git Graph Lens Extension',
    description: 'Tiện ích mở rộng vẽ cây thư mục Git trực quan trực tiếp trên SN Terminal với khả năng interactive merge.',
    price: '149.000đ',
    category: 'Plugins',
    categoryLabel: 'Plugin mở rộng',
    rating: 4.8,
    reviews: 98,
    downloads: '950',
    seller: 'Hoàng Dev',
    badge: 'Mới',
    iconType: 'puzzle'
  },
  {
    id: 'market-tool-db',
    name: 'SQL DB Inspector Pro',
    description: 'Bộ công cụ trực quan hóa cấu trúc cơ sở dữ liệu, tối ưu hóa câu lệnh SQL tự động bằng AI.',
    price: '299.000đ',
    category: 'Tools',
    categoryLabel: 'Công cụ bổ trợ',
    rating: 4.7,
    reviews: 64,
    downloads: '520',
    seller: 'SN Studio',
    badge: 'Đặc biệt',
    iconType: 'wrench'
  },
  {
    id: 'market-ext-translate',
    name: 'AI Code Translator',
    description: 'Dịch trực tiếp chú thích mã nguồn và chuyển đổi ngôn ngữ lập trình (ví dụ JS sang TS hoặc Python sang Go) bằng 1 click.',
    price: '0đ',
    category: 'Extensions',
    categoryLabel: 'Tiện ích',
    rating: 4.6,
    reviews: 215,
    downloads: '4.2K',
    seller: 'Cộng đồng SN',
    badge: 'Phổ biến',
    iconType: 'plug'
  }
];

export const communityThreads: CommunityThread[] = [
  {
    id: 'thread-1',
    title: 'Hỏi cách tối ưu RAM khi chạy Docker trên WSL 2 Windows 11',
    content: 'Mình đang gặp tình trạng WSL 2 ngốn tới 12GB RAM mặc dù chỉ chạy 3 container Docker nhẹ. Có bạn nào biết cách cấu hình file .wslconfig chuẩn không ạ?',
    author: 'Minh Hoàng',
    role: 'Active Member',
    avatarSeed: 'minhhoang',
    category: 'Hỏi đáp',
    replies: 18,
    likes: 32,
    timeAgo: '2 giờ trước'
  },
  {
    id: 'thread-2',
    title: '🚀 Ra mắt SN Terminal Pro v2.4.0 với GPU acceleration!',
    content: 'Chúng tôi rất vui mừng thông báo phiên bản mới đã hoàn thiện. Hiệu năng vẽ chữ nhanh gấp 10 lần nhờ áp dụng WebGL/WebGPU. Mời anh em tải về trải nghiệm và cho ý kiến.',
    author: 'Sơn Nguyễn',
    role: 'Administrator',
    avatarSeed: 'sonnguyen',
    category: 'Thảo luận',
    replies: 45,
    likes: 128,
    timeAgo: '1 ngày trước',
    isPinned: true
  },
  {
    id: 'thread-3',
    title: 'Showcase: My Custom Cyberpunk Setup with SN Terminal',
    content: 'Vừa mod xong cái giao diện terminal kết hợp với Oh-My-Posh, trông cực kỳ ngầu. Chia sẻ cấu hình JSON cho anh em nào muốn dùng chung nhé.',
    author: 'Alex Trần',
    role: 'VIP Member',
    avatarSeed: 'alextran',
    category: 'Showcase',
    replies: 23,
    likes: 74,
    timeAgo: '3 ngày trước'
  },
  {
    id: 'thread-4',
    title: 'Đóng góp ý tưởng phát triển ứng dụng SN Flow Automation',
    content: 'Mình thấy ứng dụng Flow chạy rất tốt. Đề xuất team thêm tính năng Telegram Bot Webhook trực tiếp để dễ dàng đẩy alert từ flow về nhóm chát.',
    author: 'Tú Nguyễn',
    role: 'Developer',
    avatarSeed: 'tunguyen',
    category: 'Góp ý',
    replies: 9,
    likes: 15,
    timeAgo: '5 ngày trước'
  }
];

export const docSections: DocSection[] = [
  {
    id: 'get-started',
    title: 'Bắt đầu nhanh',
    items: [
      {
        id: 'intro',
        title: 'Giới thiệu SN Studio',
        content: `SN Studio là hệ sinh thái công cụ phần mềm cao cấp, tập trung vào việc gia tăng hiệu năng làm việc và bảo mật cho các nhà phát triển phần mềm, kỹ sư hệ thống và người dùng chuyên nghiệp.

Tất cả các phần mềm của chúng tôi đều được phát triển dựa trên triết lý:
- Tốc độ cực hạn (Tối ưu hóa tài nguyên phần cứng)
- Thẩm mỹ hiện đại (Giao diện Dark Premium, trực quan)
- Bảo mật tối đa (Zero-Trust, không thu thập dữ liệu trái phép)`
      },
      {
        id: 'installation',
        title: 'Cài đặt & Khởi chạy',
        content: `Để bắt đầu sử dụng các công cụ của SN Studio, bạn có thể tải trực tiếp file cài đặt qua mục **Ứng dụng** hoặc sử dụng SN CLI:

\`\`\`bash
# Cài đặt SN CLI toàn hệ thống
npm install -g @sn-studio/cli

# Cập nhật cơ sở dữ liệu ứng dụng
sn update

# Cài đặt SN Terminal Pro
sn install terminal-pro
\`\`\`

Sau khi cài đặt, bạn chỉ cần gõ lệnh \`sn\` hoặc ứng dụng tương ứng để chạy trực tiếp.`
      }
    ]
  },
  {
    id: 'configuration',
    title: 'Cấu hình hệ thống',
    items: [
      {
        id: 'global-config',
        title: 'Cấu hình chung (.snconfig)',
        content: `Mọi ứng dụng thuộc SN Studio đều đọc cấu hình chung từ thư mục Home của bạn tại đường dẫn \`~/.snconfig.json\`. 

Ví dụ tệp cấu hình chuẩn:
\`\`\`json
{
  "theme": "dark-premium",
  "accentColor": "#ff003c",
  "telemetry": false,
  "developerMode": true,
  "hotkeys": {
    "toggleTerminal": "Ctrl+Shift+\`"
  }
}
\`\`\``
      },
      {
        id: 'performance-tuning',
        title: 'Tối ưu hóa GPU & Bộ nhớ',
        content: `Nếu bạn sử dụng máy tính không có card đồ họa rời hoặc chạy trên môi trường máy chủ ảo, hãy cấu hình tắt tăng tốc phần cứng trong phần cấu hình của ứng dụng:

\`\`\`json
{
  "hardwareAcceleration": false,
  "renderer": "canvas"
}
\`\`\`
Điều này sẽ giúp giảm thiểu 30% lượng RAM tiêu thụ ban đầu, đánh đổi lại độ mượt của các chuyển động.`
      }
    ]
  },
  {
    id: 'api-reference',
    title: 'Tích hợp API & SDK',
    items: [
      {
        id: 'sdk-setup',
        title: 'Khởi tạo SN Node SDK',
        content: `Chúng tôi cung cấp SDK chính thức cho các dự án Node.js để tương tác trực tiếp với các tiến trình của SN Flow và SN Guardian:

\`\`\`javascript
import { SNClient } from '@sn-studio/sdk';

const client = new SNClient({
  apiKey: process.env.SN_API_KEY,
  endpoint: 'http://localhost:9920'
});

// Quét bảo mật một thư mục tệp tin
const report = await client.guardian.scanPath('./src');
console.log('Phát hiện cảnh báo bảo mật:', report.issues.length);
\`\`\``
      }
    ]
  }
];

export const membersData: MemberData[] = [
  { id: 'm-1', name: 'Sơn Nguyễn', role: 'Founder & Architect', avatarSeed: 'son', rank: 'Huyền Thoại', contributions: 892 },
  { id: 'm-2', name: 'Hoàng Lâm', role: 'Security Engineer', avatarSeed: 'lam', rank: 'Kim Cương', contributions: 450 },
  { id: 'm-3', name: 'Thu Thủy', role: 'Product Manager', avatarSeed: 'thuy', rank: 'Bạch Kim', contributions: 312 },
  { id: 'm-4', name: 'Hải Đăng', role: 'Fullstack Dev', avatarSeed: 'dang', rank: 'Vàng', contributions: 189 }
];

export const recentNotifications = [
  { id: 'n-1', title: 'Phiên bản mới SN Terminal v2.4.1 đã sẵn sàng tải về', time: '10 phút trước', urgent: true },
  { id: 'n-2', title: 'Thành viên mới Khương Duy vừa tham gia cộng đồng', time: '30 phút trước', urgent: false },
  { id: 'n-3', title: 'Marketplace đạt cột mốc 10,000 giao dịch trong tháng', time: '2 giờ trước', urgent: false },
];
