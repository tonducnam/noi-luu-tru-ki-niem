import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// ==========================================
// DỮ LIỆU MẪU BAN ĐẦU (GIỐNG HỆT BẢN GỐC)
// ==========================================
const DEFAULT_CLASS_INFO = {
  className: 'Lớp 12A1 — Niên khóa 2023 - 2026',
  title: 'Thanh Xuân Rực Rỡ Cùng Nhau',
  motto: 'Ba năm cấp ba trôi qua như một cái chớp mắt, nhưng nụ cười và những bức ảnh nơi đây sẽ ở lại mãi mãi.',
  teacher: 'Cô Nguyễn Thị Lan Hương',
  school: 'Trường THPT Chuyên Lê Hồng Phong',
  Room: 'Phòng B204 - Tầng 2 dãy nhà cổ'
};

const INITIAL_MEMBERS = [
  {
    id: 'mem-1',
    name: 'Nguyễn Minh Khôi',
    nickname: 'Khôi Ngơ',
    role: 'Lớp Trưởng',
    group: 'Tổ 1',
    isLeader: true,
    birthday: '14/05/2008',
    zodiac: 'Kim Ngưu',
    dream: 'ĐH Bách Khoa TP.HCM - Khoa học Máy tính',
    quote: 'Lớp mình trật tự 5 phút thôi, cô giáo sắp vào rồi!',
    bio: 'Chàng lớp trưởng gương mẫu ngoài lạnh trong ấm của 12A1. Luôn là người đứng ra "đỡ đạn" cho cả lớp mỗi giờ sinh hoạt chủ nhiệm và cũng là tay guitar thùng không thể thiếu trong mọi chuyến dã ngoại của lớp.',
    hobbies: ['Đàn Guitar', 'Bóng rổ chiều thứ 6', 'Giải thuật', 'Cà phê sữa đá'],
    funFact: 'Mang tiếng lớp trưởng nghiêm túc nhưng từng ngủ quên trong giờ Văn và nói mớ gọi tên món bún bò.',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    notes: [
      {
        id: 'n-101',
        author: 'Thảo Vy',
        content: 'Cảm ơn lớp trưởng đã gánh còng lưng tụi mình suốt 3 năm qua nha! Chúc ông đỗ Thủ khoa Bách Khoa nhé!',
        sticker: '🎓 Chúc đậu NV1',
        createdAt: '15/05/2026'
      },
      {
        id: 'n-102',
        author: 'Hoàng Nam',
        content: 'Lên đại học nhớ giữ kèo bóng rổ cuối tuần nha anh bạn thân!',
        sticker: '🌟 Mãi đỉnh',
        createdAt: '16/05/2026'
      }
    ],
    createdAt: 1710000001000
  },
  {
    id: 'mem-2',
    name: 'Lê Ngọc Thảo Vy',
    nickname: 'Vy Mèo',
    role: 'Bí Thư Chi Đoàn',
    group: 'Tổ 1',
    isLeader: true,
    birthday: '22/09/2008',
    zodiac: 'Xử Nữ',
    dream: 'ĐH Ngoại Thương - Kinh tế Đối ngoại',
    quote: 'Tiền quỹ lớp còn thiếu ai chưa đóng khai mau đi nè!',
    bio: 'Nữ bí thư năng động, giọng hát vàng của mọi hội diễn văn nghệ trường. Thảo Vy là "cuốn lịch sống" của 12A1 vì nhớ sinh nhật của tất cả 42 thành viên trong lớp và luôn chuẩn bị bánh kem bất ngờ.',
    hobbies: ['Ca hát', 'Làm đồ handmade', 'Chụp ảnh Film', 'Trà đào cam sả'],
    funFact: 'Trong cặp lúc nào cũng có đủ băng cá nhân, kẹp tóc, khăn giấy và kẹo ngọt cho cả tổ.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    notes: [
      {
        id: 'n-201',
        author: 'Minh Khôi',
        content: 'Không có bà chắc tui không xoay sở nổi mấy vụ văn nghệ với hội trại của lớp đâu. Mãi rạng rỡ như nắng mùa thu nhé Vy!',
        sticker: '❤️ Thương nhiều',
        createdAt: '14/05/2026'
      }
    ],
    createdAt: 1710000002000
  },
  {
    id: 'mem-3',
    name: 'Trần Hoàng Nam',
    nickname: 'Nam Muối',
    role: 'Thành Viên',
    group: 'Tổ 2',
    isLeader: false,
    birthday: '03/11/2008',
    zodiac: 'Bọ Cạp',
    dream: 'ĐH Kiến Trúc TP.HCM - Thiết kế Đồ họa',
    quote: 'Học không chơi đánh rơi tuổi trẻ, chơi không học mất cả tương lai!',
    bio: 'Vựa muối mặn mà nhất lớp 12A1 và cũng là "nhiếp ảnh gia chuyên săn ảnh dìm" của cả lớp. Dù hay trêu chọc bạn bè nhưng Nam lại là người thiết kế toàn bộ áo lớp, banner hội trại và kỷ yếu.',
    hobbies: ['Vẽ ký họa', 'Săn ảnh dìm bạn bè', 'Trượt ván', 'Ăn bánh tráng trộn'],
    funFact: 'Đã vẽ chân dung biếm họa cho toàn bộ thầy cô bộ môn vào mặt sau quyển vở Nháp.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    notes: [
      {
        id: 'n-301',
        author: 'Khánh Linh',
        content: 'Xóa bớt ảnh dìm của tui trong điện thoại ông đi nha Nam! Dù sao cũng cảm ơn vì tấm phông nền kỷ yếu siêu đẹp!',
        sticker: '😂 Cây hài của lớp',
        createdAt: '12/05/2026'
      }
    ],
    createdAt: 1710000003000
  },
  {
    id: 'mem-4',
    name: 'Phạm Bảo Khánh Linh',
    nickname: 'Linh Bánh Bao',
    role: 'Phó Học Tập',
    group: 'Tổ 2',
    isLeader: true,
    birthday: '19/02/2008',
    zodiac: 'Song Ngư',
    dream: 'ĐH Y Dược TP.HCM - Bác sĩ Đa khoa',
    quote: 'Câu này dễ mà, để tui giảng lại cho nghe nè!',
    bio: '"Bách khoa toàn thư" môn Hóa - Sinh của 12A1. Trước mỗi kỳ thi học kỳ, bàn của Khánh Linh luôn biến thành trung tâm phụ đạo cấp tốc cho cả lớp với những tờ đề cương viết tay 3 màu mực cực kỳ dễ hiểu.',
    hobbies: ['Đọc tiểu thuyết trinh thám', 'Nấu chè', 'Ghi chép Calligraphy', 'Chăm mèo'],
    funFact: 'Có thể giải xong bài toán Hóa hữu cơ khó chỉ trong 3 phút nhưng lại mất 30 phút để chọn món ăn trưa ở căng-tin.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    notes: [
      {
        id: 'n-401',
        author: 'Gia Bảo',
        content: 'Nhờ đề cương Hóa của Linh mà tui qua môn ngoạn mục. Sau này thành bác sĩ giỏi nhớ khám miễn phí cho bạn cùng lớp nha!',
        sticker: '🎓 Chúc đậu NV1',
        createdAt: '15/05/2026'
      }
    ],
    createdAt: 1710000004000
  },
  {
    id: 'mem-5',
    name: 'Đặng Gia Bảo',
    nickname: 'Bảo Gấu',
    role: 'Tổ Trưởng Tổ 3',
    group: 'Tổ 3',
    isLeader: true,
    birthday: '08/08/2008',
    zodiac: 'Sư Tử',
    dream: 'ĐH Kinh tế TP.HCM (UEH) - Marketing',
    quote: 'Chiều nay tan học đi ăn ốc hay trà sữa đây anh em?',
    bio: 'Thổ địa ẩm thực Sài Gòn, người khởi xướng mọi cuộc liên hoan của lớp. Gia Bảo có nụ cười tỏa nắng, luôn nhiệt tình giúp các bạn nữ bê bàn ghế, dựng lều trại và trực nhật giúp bạn khi bạn ốm.',
    hobbies: ['Review đồ ăn vặt', 'Đá bóng vị trí Thủ môn', 'Quay Vlog lớp', 'Chơi cờ vua'],
    funFact: 'Quay hơn 200 video ngắn ghi lại cảnh hậu trường lầy lội của lớp trong suốt 3 năm học.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    notes: [
      {
        id: 'n-501',
        author: 'Mai Anh',
        content: 'Tổ trưởng tuyệt vời nhất quả đất! Cảm ơn Bảo luôn bao che cho tổ 3 những hôm tụi mình ăn quà vặt nhé!',
        sticker: '🌟 Mãi đỉnh',
        createdAt: '16/05/2026'
      }
    ],
    createdAt: 1710000005000
  },
  {
    id: 'mem-6',
    name: 'Vũ Hoàng Mai Anh',
    nickname: 'Mây Nhỏ',
    role: 'Thành Viên',
    group: 'Tổ 4',
    isLeader: false,
    birthday: '27/12/2008',
    zodiac: 'Ma Kết',
    dream: 'ĐH Khoa học Xã hội & Nhân văn - Báo chí Truyền thông',
    quote: 'Mỗi ngày đến lớp cùng 12A1 đều là một trang nhật ký đẹp nhất.',
    bio: 'Cô gái dịu dàng ngồi bàn cuối cạnh cửa sổ, người viết lời dẫn chương trình cho mọi buổi lễ tri ân và trưởng thành của lớp. Mai Anh thích lưu giữ những cánh phượng ép khô và những bức ảnh chụp lén nụ cười của bạn bè.',
    hobbies: ['Viết tản văn', 'Chụp ảnh máy cơ', 'Nghe nhạc Indie', 'Sưu tầm bưu thiếp'],
    funFact: 'Là tác giả ẩn danh của fanpage "Chuyện nhỏ ở 12A1" khiến cả lớp bất ngờ vào ngày bế giảng.',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    notes: [
      {
        id: 'n-601',
        author: 'Thảo Vy',
        content: 'Bài văn tri ân Mai Anh đọc hôm lễ trưởng thành làm cả lớp khóc sướt mướt luôn. Mãi giữ tâm hồn ấm áp này nhé!',
        sticker: '😭 Đừng quên nhau nhé',
        createdAt: '16/05/2026'
      }
    ],
    createdAt: 1710000006000
  }
];

const INITIAL_PHOTOS = [
  {
    id: 'photo-1',
    memberId: 'mem-1',
    taggedMemberIds: ['mem-1', 'mem-3', 'mem-5'],
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80',
    caption: 'Buổi chiều ôn thi cuối cấp ở hành lang tầng 2',
    story: 'Hôm đó trời mưa tầm tã sau giờ học thêm, Minh Khôi đem đàn guitar ra gảy còn cả đám ngồi quây quần vừa giải đề Toán vừa nghêu ngao hát.',
    date: '12/04/2026',
    category: 'Khoảnh khắc trên lớp',
    uploadedBy: 'Hoàng Nam',
    likes: 28,
    rotation: -1.5,
    createdAt: 1710000101000
  },
  {
    id: 'photo-2',
    memberId: 'mem-1',
    taggedMemberIds: ['mem-1', 'mem-2'],
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=900&q=80',
    caption: 'Đêm lửa trại Đà Lạt không ngủ cùng lớp trưởng',
    story: 'Chuyến đi Đà Lạt 3 ngày 2 đêm đáng nhớ nhất thời học sinh. Khôi và Vy dẫn chương trình đốt lửa trại đến tận 1 giờ sáng.',
    date: '26/03/2026',
    category: 'Dã ngoại & Đà Lạt',
    uploadedBy: 'Thảo Vy',
    likes: 35,
    rotation: 2,
    createdAt: 1710000102000
  },
  {
    id: 'photo-3',
    memberId: 'mem-2',
    taggedMemberIds: ['mem-2', 'mem-4', 'mem-6'],
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80',
    caption: 'Hội chị em bàn đầu rạng rỡ ngày 20/11',
    story: 'Sáng 20/11 cả nhóm dậy từ 5h sáng mặc áo dài trắng đến trường trang trí bảng phấn màu bất ngờ tặng cô Lan Hương.',
    date: '20/11/2025',
    category: 'Văn nghệ & Hội trại',
    uploadedBy: 'Mai Anh',
    likes: 41,
    rotation: -2,
    createdAt: 1710000103000
  },
  {
    id: 'photo-4',
    memberId: 'mem-3',
    taggedMemberIds: ['mem-3', 'mem-5'],
    imageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=900&q=80',
    caption: 'Tác giả của những chiếc phông nền hội trại',
    story: 'Hoàng Nam và Gia Bảo thức trắng buổi trưa ở nhà thi đấu để vẽ cổng trại cho kịp giờ chấm điểm của Đoàn trường.',
    date: '26/03/2026',
    category: 'Văn nghệ & Hội trại',
    uploadedBy: 'Gia Bảo',
    likes: 24,
    rotation: 1.5,
    createdAt: 1710000104000
  },
  {
    id: 'photo-5',
    memberId: 'mem-4',
    taggedMemberIds: ['mem-4', 'mem-2'],
    imageUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=900&q=80',
    caption: 'Giờ ra chơi phụ đạo Hóa cấp tốc của "Cô giáo Linh"',
    story: 'Chỉ còn 15 phút nữa là kiểm tra 1 tiết Hóa mà cả tổ 2 vẫn vây quanh bàn Khánh Linh để hỏi công thức este.',
    date: '10/01/2026',
    category: 'Khoảnh khắc trên lớp',
    uploadedBy: 'Minh Khôi',
    likes: 33,
    rotation: -1,
    createdAt: 1710000105000
  },
  {
    id: 'photo-6',
    memberId: 'mem-5',
    taggedMemberIds: ['mem-5', 'mem-1', 'mem-3'],
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
    caption: 'Bữa tiệc sinh nhật bất ngờ cho Tổ trưởng Tổ 3',
    story: 'Cả lớp giả vờ quên sinh nhật Gia Bảo rồi bất ngờ tắt đèn mang bánh kem ra ngay tiết Sinh hoạt lớp thứ Bảy.',
    date: '08/08/2025',
    category: 'Sinh nhật',
    uploadedBy: 'Khánh Linh',
    likes: 39,
    rotation: 2,
    createdAt: 1710000106000
  },
  {
    id: 'photo-7',
    memberId: 'mem-6',
    taggedMemberIds: ['mem-6', 'mem-2', 'mem-4'],
    imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=900&q=80',
    caption: 'Nụ cười ngày chụp ảnh kỷ yếu dưới sân trường',
    story: 'Khoảnh khắc Mai Anh cầm máy ảnh film chụp lại cả lớp dưới tán phượng vĩ đỏ rực những ngày cuối tháng 5.',
    date: '15/05/2026',
    category: 'Lễ Trưởng Thành',
    uploadedBy: 'Thảo Vy',
    likes: 47,
    rotation: -1.8,
    createdAt: 1710000107000
  }
];

const PHOTO_CATEGORIES = [
  'Tất cả',
  'Khoảnh khắc trên lớp',
  'Dã ngoại & Đà Lạt',
  'Văn nghệ & Hội trại',
  'Sinh nhật',
  'Dìm hàng thương yêu',
  'Lễ Trưởng Thành'
];

const GROUP_FILTERS = ['Tất cả', 'Ban Cán Sự', 'Tổ 1', 'Tổ 2', 'Tổ 3', 'Tổ 4'];

const STICKER_OPTIONS = [
  '🎓 Chúc đậu NV1',
  '❤️ Thương nhiều',
  '🌟 Mãi đỉnh',
  '😭 Đừng quên nhau nhé',
  '😂 Cây hài của lớp',
  '🍀 Luôn hạnh phúc nha'
];

const SAMPLE_PRESET_PHOTOS = [
  {
    label: 'Cả nhóm học bài',
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80'
  },
  {
    label: 'Chuyến dã ngoại',
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80'
  },
  {
    label: 'Đêm lửa trại',
    url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=900&q=80'
  },
  {
    label: 'Ngày tốt nghiệp',
    url: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80'
  }
];

// ==========================================
// STATE QUẢN LÝ TRẠNG THÁI ỨNG DỤNG
// ==========================================
const state = {
  user: null,
  classInfo: { ...DEFAULT_CLASS_INFO },
  members: JSON.parse(JSON.stringify(INITIAL_MEMBERS)),
  photos: JSON.parse(JSON.stringify(INITIAL_PHOTOS)),
  activeTab: 'members', // 'members' | 'gallery' | 'guestbook'
  searchQuery: '',
  selectedGroup: 'Tất cả',
  selectedPhotoCategory: 'Tất cả',
  selectedPhotoMemberFilter: 'all',

  // Trạng thái Modal Tiểu sử cá nhân
  activeMemberId: null,
  profileSubTab: 'photos', // 'photos' | 'notes'
  showInlinePhotoForm: false,
  inlinePhotoFormState: {
    imageUrl: '',
    caption: '',
    story: '',
    date: new Date().toLocaleDateString('vi-VN'),
    category: 'Khoảnh khắc trên lớp',
    uploadedBy: '',
    coTaggedIds: []
  },

  // Trạng thái Modal Thêm/Sửa Thành viên
  editingMemberId: null,
  memberFormAvatar: '',

  // Trạng thái Modal Đăng Ảnh Kỷ Niệm
  addPhotoModalState: {
    memberId: 'mem-1',
    taggedMemberIds: ['mem-1'],
    imageUrl: '',
    caption: '',
    story: '',
    date: new Date().toLocaleDateString('vi-VN'),
    category: 'Khoảnh khắc trên lớp',
    uploadedBy: ''
  },

  // Lightbox xem ảnh
  lightboxPhotoId: null
};

// ==========================================
// TIỆN ÍCH ESCAPE HTML & NÉN ẢNH CANVAS
// ==========================================
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function compressImageFile(file, maxWidth = 720, quality = 0.68) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
      img.src = event.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

let toastTimeout = null;
function showToast(message) {
  const container = document.getElementById('toast-container');
  const textEl = document.getElementById('toast-message');
  if (!container || !textEl) return;
  textEl.textContent = message;
  container.classList.remove('hidden');
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    container.classList.add('hidden');
  }, 3400);
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// ==========================================
// KHỞI TẠO FIREBASE & ĐỒNG BỘ DỮ LIỆU
// ==========================================
const appId = typeof __app_id !== 'undefined' ? __app_id : 'ky-yeu-lop-chung-minh-app';
let app = null;
let auth = null;
let db = null;

try {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    const firebaseConfig = JSON.parse(__firebase_config);
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (err) {
  console.error('Lỗi khởi tạo kết nối lưu trữ:', err);
}

async function initFirebaseSync() {
  if (!auth || !db) return;
  try {
    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
      await signInWithCustomToken(auth, __initial_auth_token);
    } else {
      await signInAnonymously(auth);
    }
  } catch (err) {
    console.error('Lỗi xác thực phiên làm việc:', err);
  }

  onAuthStateChanged(auth, (currentUser) => {
    state.user = currentUser;
    const badge = document.getElementById('sync-status-badge');
    const uidText = document.getElementById('sync-uid-text');
    if (currentUser && badge && uidText) {
      uidText.textContent = currentUser.uid;
      badge.classList.remove('hidden');
      badge.classList.add('inline-flex');
      setupFirestoreListeners();
    }
  });
}

function setupFirestoreListeners() {
  if (!state.user || !db) return;

  const membersColRef = collection(db, 'artifacts', appId, 'public', 'data', 'class_members');
  const photosColRef = collection(db, 'artifacts', appId, 'public', 'data', 'class_photos');
  const settingsColRef = collection(db, 'artifacts', appId, 'public', 'data', 'class_settings');

  onSnapshot(
    membersColRef,
    async (snapshot) => {
      if (snapshot.empty) {
        for (const item of INITIAL_MEMBERS) {
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'class_members', item.id), item);
        }
      } else {
        const loaded = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        loaded.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        state.members = loaded;
        renderAll();
      }
    },
    (error) => console.error('Lỗi tải danh sách thành viên:', error)
  );

  onSnapshot(
    photosColRef,
    async (snapshot) => {
      if (snapshot.empty) {
        for (const p of INITIAL_PHOTOS) {
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'class_photos', p.id), p);
        }
      } else {
        const loadedPhotos = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        loadedPhotos.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        state.photos = loadedPhotos;
        renderAll();
      }
    },
    (error) => console.error('Lỗi tải kho ảnh kỷ niệm:', error)
  );

  onSnapshot(
    settingsColRef,
    async (snapshot) => {
      const infoDoc = snapshot.docs.find((d) => d.id === 'info');
      if (infoDoc) {
        state.classInfo = infoDoc.data();
        renderBannerAndFooter();
      } else {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'class_settings', 'info'), DEFAULT_CLASS_INFO);
      }
    },
    (error) => console.error('Lỗi tải thông tin lớp:', error)
  );
}

// ==========================================
// CÁC HÀM TRUY VẤN & LỌC DỮ LIỆU
// ==========================================
function getMemberPhotos(memberId) {
  return state.photos.filter(
    (p) =>
      p.memberId === memberId ||
      (Array.isArray(p.taggedMemberIds) && p.taggedMemberIds.includes(memberId))
  );
}

function getFilteredMembers() {
  const q = state.searchQuery.trim().toLowerCase();
  return state.members.filter((m) => {
    const matchesSearch =
      !q ||
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.nickname && m.nickname.toLowerCase().includes(q)) ||
      (m.quote && m.quote.toLowerCase().includes(q)) ||
      (m.dream && m.dream.toLowerCase().includes(q)) ||
      (m.role && m.role.toLowerCase().includes(q));

    const matchesGroup =
      state.selectedGroup === 'Tất cả' ||
      (state.selectedGroup === 'Ban Cán Sự' && m.isLeader) ||
      m.group === state.selectedGroup;

    return matchesSearch && matchesGroup;
  });
}

function getFilteredPhotos() {
  return state.photos.filter((p) => {
    const matchesCat =
      state.selectedPhotoCategory === 'Tất cả' || p.category === state.selectedPhotoCategory;
    const matchesMember =
      state.selectedPhotoMemberFilter === 'all' ||
      p.memberId === state.selectedPhotoMemberFilter ||
      (Array.isArray(p.taggedMemberIds) &&
        p.taggedMemberIds.includes(state.selectedPhotoMemberFilter));
    return matchesCat && matchesMember;
  });
}

function getTotalNotesCount() {
  return state.members.reduce((sum, m) => sum + (Array.isArray(m.notes) ? m.notes.length : 0), 0);
}

// ==========================================
// CÁC HÀM RENDER GIAO DIỆN CHÍNH
// ==========================================
function renderBannerAndFooter() {
  document.getElementById('banner-school').textContent = state.classInfo.school || '';
  document.getElementById('banner-classname').textContent = state.classInfo.className || '';
  document.getElementById('banner-title').textContent = state.classInfo.title || '';
  document.getElementById('banner-motto').textContent = `“${state.classInfo.motto || ''}”`;
  document.getElementById('banner-teacher').textContent = state.classInfo.teacher || '';
  document.getElementById('banner-room').textContent = state.classInfo.Room || 'Phòng học 12A1';
  document.getElementById('footer-classname').textContent = state.classInfo.className || '';

  const totalNotes = getTotalNotesCount();
  document.getElementById('stat-members-count').textContent = state.members.length;
  document.getElementById('stat-photos-count').textContent = state.photos.length;
  document.getElementById('stat-notes-count').textContent = totalNotes;

  document.getElementById('tab-badge-members').textContent = state.members.length;
  document.getElementById('tab-badge-gallery').textContent = state.photos.length;
  document.getElementById('tab-badge-guestbook').textContent = totalNotes;
}

function renderTabsState() {
  const tabs = ['members', 'gallery', 'guestbook'];
  tabs.forEach((tab) => {
    const btn = document.getElementById(`tab-btn-${tab}`);
    const sec = document.getElementById(`section-${tab}`);
    if (state.activeTab === tab) {
      btn.className = 'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap bg-indigo-950 text-amber-50 shadow-md';
      sec.classList.remove('hidden');
    } else {
      btn.className = 'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap text-slate-600 hover:bg-amber-100/60';
      sec.classList.add('hidden');
    }
  });
}

function renderMembersSection() {
  // Render nút lọc Tổ / Ban Cán Sự
  const groupContainer = document.getElementById('group-filter-container');
  groupContainer.innerHTML = GROUP_FILTERS.map((group) => {
    const isActive = state.selectedGroup === group;
    return `
      <button
        onclick="selectGroupFilter('${escapeHtml(group)}')"
        class="px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
          isActive
            ? 'bg-amber-500 text-white shadow-sm'
            : 'bg-amber-50/80 text-slate-600 hover:bg-amber-100'
        }"
      >
        ${escapeHtml(group)}
      </button>
    `;
  }).join('');

  // Render lưới thành viên
  const gridContainer = document.getElementById('members-grid-container');
  const filtered = getFilteredMembers();

  if (filtered.length === 0) {
    gridContainer.innerHTML = `
      <div class="bg-white rounded-3xl p-12 text-center border border-dashed border-amber-300 max-w-lg mx-auto my-8">
        <i data-lucide="users" class="w-12 h-12 text-amber-400 mx-auto mb-3"></i>
        <h3 class="text-lg font-bold text-indigo-950">
          Không tìm thấy thành viên phù hợp
        </h3>
        <p class="text-sm text-slate-500 mt-1 mb-5">
          Hãy thử từ khóa khác hoặc thêm hồ sơ thành viên mới vào lớp nhé.
        </p>
        <div class="flex justify-center gap-3">
          <button
            onclick="resetMemberFilters()"
            class="px-4 py-2 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold"
          >
            Xóa bộ lọc
          </button>
          <button
            onclick="handleRestoreSampleData()"
            class="px-4 py-2 rounded-xl bg-indigo-950 text-white text-xs font-bold inline-flex items-center gap-1.5"
          >
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
            Khôi phục dữ liệu mẫu
          </button>
        </div>
      </div>
    `;
    return;
  }

  gridContainer.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
      ${filtered
        .map((member) => {
          const memberPhotos = getMemberPhotos(member.id);
          const notesCount = Array.isArray(member.notes) ? member.notes.length : 0;
          const fallbackAvatar =
            'https://placehold.co/600x600/FEF3C7/78350F?text=' +
            encodeURIComponent(member.name);

          const previewThumbs = memberPhotos
            .slice(0, 4)
            .map(
              (p) => `
              <img
                src="${escapeHtml(p.imageUrl)}"
                alt="${escapeHtml(p.caption)}"
                onerror="this.src='https://placehold.co/120x120/FDE68A/78350F?text=Anh'"
                class="w-10 h-10 rounded-xl object-cover ring-2 ring-white shadow-sm"
              />
            `
            )
            .join('');

          const extraCountBadge =
            memberPhotos.length > 4
              ? `<div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center ring-2 ring-white">+${memberPhotos.length - 4}</div>`
              : '';

          const emptyPhotosText =
            memberPhotos.length === 0
              ? `<span class="text-xs text-slate-400 italic">Chưa có ảnh — bấm để thêm ảnh đầu tiên!</span>`
              : '';

          return `
            <div
              onclick="openMemberProfile('${escapeHtml(member.id)}', 'photos', false)"
              class="group cursor-pointer bg-white rounded-3xl border border-amber-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative hover:-translate-y-1.5"
            >
              <!-- Miếng băng keo trang trí kiểu sổ lưu bút -->
              <div class="w-24 h-5 bg-amber-200/60 backdrop-blur-sm absolute top-2 left-1/2 -translate-x-1/2 z-20 rotate-[-2deg] rounded-sm pointer-events-none border border-amber-300/40"></div>

              <!-- Khung ảnh chân dung Polaroid -->
              <div class="p-4 pb-0">
                <div class="relative h-64 rounded-2xl overflow-hidden bg-amber-50 border border-amber-100">
                  <img
                    src="${escapeHtml(member.avatar)}"
                    alt="${escapeHtml(member.name)}"
                    onerror="this.src='${fallbackAvatar}'"
                    class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-indigo-950/80 via-indigo-950/15 to-transparent"></div>

                  <!-- Huy hiệu Chức vụ & Tổ -->
                  <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span class="px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-indigo-950 backdrop-blur-md shadow-sm">
                      ${escapeHtml(member.group)}
                    </span>
                    ${
                      member.role && member.role !== 'Thành Viên'
                        ? `<span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-indigo-950 shadow-sm flex items-center gap-1">
                            <i data-lucide="award" class="w-3 h-3"></i>
                            ${escapeHtml(member.role)}
                          </span>`
                        : ''
                    }
                  </div>

                  <!-- Số lượng ảnh kỷ niệm trong tiểu sử bạn này -->
                  <div class="absolute top-3 right-3">
                    <span class="px-3 py-1 rounded-full text-xs font-bold bg-indigo-950/85 text-amber-200 backdrop-blur-md flex items-center gap-1.5 border border-amber-400/30">
                      <i data-lucide="camera" class="w-3.5 h-3.5 text-amber-400"></i>
                      ${memberPhotos.length} ảnh kỷ niệm
                    </span>
                  </div>

                  <!-- Tên & Biệt danh trên nền ảnh -->
                  <div class="absolute bottom-3 left-4 right-4 text-white">
                    <div class="text-xs font-semibold text-amber-300">
                      Biệt danh: “${escapeHtml(member.nickname || 'Chưa có')}”
                    </div>
                    <h3 class="text-xl font-black tracking-tight">
                      ${escapeHtml(member.name)}
                    </h3>
                  </div>
                </div>
              </div>

              <!-- Thông tin tóm tắt & Câu nói thương hiệu -->
              <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div class="space-y-3">
                  <div class="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-3.5 relative">
                    <i data-lucide="quote" class="w-4 h-4 text-amber-500/60 absolute top-2.5 left-2.5"></i>
                    <p class="text-xs sm:text-sm font-medium text-amber-950 italic pl-5 line-clamp-2">
                      “${escapeHtml(member.quote || 'Thanh xuân tươi đẹp nhất là khi có các bạn.')}”
                    </p>
                  </div>

                  <p class="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    ${escapeHtml(member.bio)}
                  </p>

                  <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
                    <span class="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                      <i data-lucide="calendar" class="w-3.5 h-3.5 text-rose-500"></i>
                      ${escapeHtml(member.birthday)}
                    </span>
                    ${
                      member.dream
                        ? `<span class="inline-flex items-center gap-1 bg-indigo-50 text-indigo-900 px-2.5 py-1 rounded-lg font-medium truncate max-w-[210px]">
                            <i data-lucide="graduation-cap" class="w-3.5 h-3.5 text-indigo-600 shrink-0"></i>
                            <span class="truncate">${escapeHtml(member.dream)}</span>
                          </span>`
                        : ''
                    }
                  </div>
                </div>

                <!-- Dải xem trước các bức ảnh kỷ niệm được lưu trong tiểu sử bạn này -->
                <div class="pt-3 border-t border-amber-100">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Kho ảnh kỷ niệm trong tiểu sử (${memberPhotos.length})
                    </span>
                    <span class="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                      <i data-lucide="message-square-heart" class="w-3 h-3"></i>
                      ${notesCount} lưu bút
                    </span>
                  </div>

                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center -space-x-2 overflow-hidden py-1 pl-1">
                      ${previewThumbs}
                      ${extraCountBadge}
                      ${emptyPhotosText}
                    </div>

                    <div class="flex items-center gap-1.5 shrink-0">
                      <button
                        onclick="event.stopPropagation(); openMemberProfile('${escapeHtml(member.id)}', 'photos', true)"
                        class="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold inline-flex items-center gap-1 transition"
                        title="Thêm ảnh kỷ niệm vào tiểu sử của bạn này"
                      >
                        <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                        <span>Thêm Ảnh</span>
                      </button>
                      <button class="px-3 py-2 rounded-xl bg-indigo-950 group-hover:bg-amber-500 group-hover:text-indigo-950 text-white text-xs font-bold transition">
                        Xem Tiểu Sử
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
        })
        .join('')}
    </div>
  `;
}

function renderGallerySection() {
  // Danh mục chủ đề
  const catContainer = document.getElementById('photo-category-filter-container');
  catContainer.innerHTML = PHOTO_CATEGORIES.map((cat) => {
    const isActive = state.selectedPhotoCategory === cat;
    return `
      <button
        onclick="selectPhotoCategory('${escapeHtml(cat)}')"
        class="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
          isActive
            ? 'bg-indigo-950 text-amber-300'
            : 'bg-amber-50 text-slate-600 hover:bg-amber-100'
        }"
      >
        ${escapeHtml(cat)}
      </button>
    `;
  }).join('');

  // Dropdown chọn thành viên
  const selectEl = document.getElementById('photo-member-filter-select');
  selectEl.innerHTML = `
    <option value="all" ${state.selectedPhotoMemberFilter === 'all' ? 'selected' : ''}>Tất cả thành viên trong lớp</option>
    ${state.members
      .map(
        (m) => `
      <option value="${escapeHtml(m.id)}" ${state.selectedPhotoMemberFilter === m.id ? 'selected' : ''}>
        Ảnh của ${escapeHtml(m.name)} (${escapeHtml(m.nickname)})
      </option>
    `
      )
      .join('')}
  `;

  // Lưới ảnh Polaroid
  const gridContainer = document.getElementById('photos-grid-container');
  const filtered = getFilteredPhotos();

  if (filtered.length === 0) {
    gridContainer.innerHTML = `
      <div class="bg-white rounded-3xl p-12 text-center border border-dashed border-amber-300 max-w-lg mx-auto">
        <i data-lucide="image" class="w-12 h-12 text-amber-400 mx-auto mb-3"></i>
        <h4 class="text-base font-bold text-indigo-950">
          Chưa có bức ảnh nào trong mục này
        </h4>
        <p class="text-xs text-slate-500 mt-1 mb-4">
          Hãy là người đầu tiên đăng bức ảnh kỷ niệm cho chủ đề này nhé!
        </p>
        <button
          onclick="openAddPhotoModal(null)"
          class="px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold"
        >
          + Đăng ảnh ngay
        </button>
      </div>
    `;
    return;
  }

  gridContainer.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
      ${filtered
        .map((photo) => {
          const taggedPeople = state.members.filter(
            (m) =>
              m.id === photo.memberId ||
              (Array.isArray(photo.taggedMemberIds) && photo.taggedMemberIds.includes(m.id))
          );

          const taggedHtml = taggedPeople
            .map((person) => {
              const shortName = person.nickname || person.name.split(' ').pop();
              return `
                <button
                  onclick="event.stopPropagation(); openMemberProfile('${escapeHtml(person.id)}', 'photos', false)"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100/90 hover:bg-amber-300 text-amber-950 text-[11px] font-bold transition"
                >
                  <img
                    src="${escapeHtml(person.avatar)}"
                    alt="${escapeHtml(person.name)}"
                    class="w-3.5 h-3.5 rounded-full object-cover"
                  />
                  <span>${escapeHtml(shortName)}</span>
                </button>
              `;
            })
            .join('');

          return `
            <div
              onclick="openLightbox('${escapeHtml(photo.id)}')"
              style="transform: rotate(${photo.rotation || 0}deg)"
              onmouseenter="this.style.transform='rotate(0deg)'"
              onmouseleave="this.style.transform='rotate(${photo.rotation || 0}deg)'"
              class="group cursor-pointer bg-white p-4 pb-5 rounded-2xl shadow-md hover:shadow-2xl border border-amber-200/70 transition-all duration-300 flex flex-col justify-between relative"
            >
              <!-- Ghim băng keo Polaroid -->
              <div class="w-20 h-4 bg-rose-200/50 absolute -top-2 left-1/2 -translate-x-1/2 rotate-2 rounded-sm pointer-events-none"></div>

              <div>
                <div class="relative h-60 rounded-xl overflow-hidden bg-slate-100 mb-3.5">
                  <img
                    src="${escapeHtml(photo.imageUrl)}"
                    alt="${escapeHtml(photo.caption)}"
                    onerror="this.src='https://placehold.co/800x600/FEF3C7/78350F?text=Ky+Niem+12A1'"
                    class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div class="absolute top-2.5 left-2.5">
                    <span class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-950/80 text-amber-200 backdrop-blur-sm">
                      ${escapeHtml(photo.category)}
                    </span>
                  </div>
                  <div class="absolute top-2.5 right-2.5 flex items-center gap-1">
                    <button
                      onclick="event.stopPropagation(); handleLikePhoto('${escapeHtml(photo.id)}')"
                      class="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                      <i data-lucide="heart" class="w-3.5 h-3.5 fill-rose-500 text-rose-500"></i>
                      <span>${photo.likes || 0}</span>
                    </button>
                  </div>
                </div>

                <div class="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1">
                  <span>📅 ${escapeHtml(photo.date)}</span>
                  <span>Đăng bởi: ${escapeHtml(photo.uploadedBy)}</span>
                </div>

                <h4 class="font-bold text-indigo-950 text-base leading-snug mb-1.5">
                  ${escapeHtml(photo.caption)}
                </h4>

                ${
                  photo.story
                    ? `<p class="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">${escapeHtml(photo.story)}</p>`
                    : ''
                }
              </div>

              <!-- Các bạn được gắn thẻ trong bức ảnh này -->
              <div class="pt-3 border-t border-amber-100 flex items-center justify-between gap-2 flex-wrap">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-[11px] text-slate-400 font-medium">
                    Trong tiểu sử:
                  </span>
                  ${taggedHtml}
                </div>

                <button
                  onclick="event.stopPropagation(); confirmDeletePhoto('${escapeHtml(photo.id)}')"
                  class="text-slate-300 hover:text-rose-600 p-1 transition"
                  title="Xóa ảnh"
                >
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </div>
          `;
        })
        .join('')}
    </div>
  `;
}

function renderGuestbookSection() {
  const container = document.getElementById('guestbook-grid-container');
  const allNotes = state.members.flatMap((member) =>
    (member.notes || []).map((note) => ({
      ...note,
      recipient: member
    }))
  );

  container.innerHTML = allNotes
    .map(
      (item) => `
      <div
        onclick="openMemberProfile('${escapeHtml(item.recipient.id)}', 'notes', false)"
        class="cursor-pointer bg-[#FFFDF5] hover:bg-amber-50/70 p-5 rounded-3xl border border-amber-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
      >
        <div class="space-y-3">
          <div class="flex items-center justify-between gap-2">
            <span class="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
              ${escapeHtml(item.sticker)}
            </span>
            <span class="text-[11px] text-slate-400">${escapeHtml(item.createdAt)}</span>
          </div>

          <p class="text-sm text-slate-700 leading-relaxed italic">
            “${escapeHtml(item.content)}”
          </p>
        </div>

        <div class="pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs">
          <span class="font-bold text-indigo-950">
            ✍️ Từ: ${escapeHtml(item.author)}
          </span>
          <span class="inline-flex items-center gap-1.5 text-amber-800 font-semibold">
            <span>Gửi đến:</span>
            <img
              src="${escapeHtml(item.recipient.avatar)}"
              alt="${escapeHtml(item.recipient.name)}"
              class="w-5 h-5 rounded-full object-cover"
            />
            <span class="underline">${escapeHtml(item.recipient.name)}</span>
          </span>
        </div>
      </div>
    `
    )
    .join('');
}

function renderAll() {
  renderBannerAndFooter();
  renderTabsState();
  renderMembersSection();
  renderGallerySection();
  renderGuestbookSection();
  if (state.activeMemberId) {
    renderProfileModal();
  }
  if (state.lightboxPhotoId) {
    renderLightboxModal();
  }
  refreshIcons();
}

// ==========================================
// RENDER MODAL CHI TIẾT TIỂU SỬ & KHO ẢNH CÁ NHÂN
// ==========================================
function renderProfileModal() {
  const root = document.getElementById('profile-modal-root');
  const member = state.members.find((m) => m.id === state.activeMemberId);
  if (!member) {
    root.classList.add('hidden');
    root.innerHTML = '';
    return;
  }

  root.classList.remove('hidden');
  const memberPhotos = getMemberPhotos(member.id);
  const shortFirstName = member.name.split(' ').pop();

  const currentIndex = state.members.findIndex((m) => m.id === member.id);
  const prevMember =
    currentIndex > 0 ? state.members[currentIndex - 1] : state.members[state.members.length - 1];
  const nextMember =
    currentIndex < state.members.length - 1 ? state.members[currentIndex + 1] : state.members[0];

  const fallbackAvatar =
    'https://placehold.co/600x600/FEF3C7/78350F?text=' + encodeURIComponent(member.name);

  // Sở thích
  const hobbiesHtml =
    Array.isArray(member.hobbies) && member.hobbies.length > 0
      ? `
        <div class="space-y-2 pt-1">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Sở thích đặc trưng:
          </span>
          <div class="flex flex-wrap gap-1.5">
            ${member.hobbies
              .map(
                (hb) => `
              <span class="px-3 py-1 rounded-full bg-amber-100/80 text-amber-950 text-xs font-semibold">
                #${escapeHtml(hb)}
              </span>
            `
              )
              .join('')}
          </div>
        </div>
      `
      : '';

  // Fun fact
  const funFactHtml = member.funFact
    ? `
      <div class="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-100 text-xs space-y-1">
        <span class="text-rose-600 font-bold flex items-center gap-1.5">
          <i data-lucide="smile" class="w-4 h-4"></i>
          Sự thật thú vị chỉ lớp mình mới biết:
        </span>
        <p class="text-slate-700 leading-relaxed">${escapeHtml(member.funFact)}</p>
      </div>
    `
    : '';

  // Phần nội dung bên phải: Kho ảnh hoặc Lưu bút
  let rightColumnContent = '';

  if (state.profileSubTab === 'photos') {
    const inlineFormHtml = state.showInlinePhotoForm
      ? `
        <form onsubmit="submitInlinePhotoForm(event)" class="bg-white p-5 rounded-3xl border-2 border-amber-400 shadow-lg space-y-4 animate-fadeIn">
          <div class="flex items-center justify-between border-b border-amber-100 pb-3">
            <h4 class="text-sm font-black text-indigo-950 flex items-center gap-2">
              <i data-lucide="folder-heart" class="w-5 h-5 text-amber-500"></i>
              <span>Lưu Trữ Ảnh Kỷ Niệm Vào Tiểu Sử Của ${escapeHtml(member.name)}</span>
            </h4>
            <button type="button" onclick="toggleInlinePhotoForm(false)" class="text-slate-400 hover:text-slate-600">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">
                1. Tải ảnh từ thiết bị (Tự động tối ưu dung lượng)
              </label>
              <label class="cursor-pointer flex flex-col items-center justify-center h-28 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 hover:bg-amber-50 transition p-3 text-center">
                <i data-lucide="upload" class="w-6 h-6 text-amber-600 mb-1"></i>
                <span id="inline-upload-status" class="text-xs font-bold text-amber-950">
                  Chọn file ảnh từ máy / điện thoại
                </span>
                <span class="text-[11px] text-slate-400">JPG, PNG, WEBP</span>
                <input type="file" accept="image/*" onchange="handleInlinePhotoFileChange(event)" class="hidden" />
              </label>
            </div>

            <div class="space-y-2">
              <label class="block text-xs font-bold text-slate-700">
                Hoặc dán đường dẫn ảnh (URL) / Chọn ảnh mẫu:
              </label>
              <input
                id="inline-photo-url-input"
                type="text"
                value="${escapeHtml(state.inlinePhotoFormState.imageUrl)}"
                oninput="updateInlinePhotoField('imageUrl', this.value)"
                placeholder="https://..."
                class="w-full px-3.5 py-2 rounded-xl border border-amber-200 text-xs focus:outline-none focus:border-amber-500"
              />
              <div class="flex flex-wrap gap-1">
                ${SAMPLE_PRESET_PHOTOS.map(
                  (preset) => `
                    <button
                      type="button"
                      onclick="selectInlinePresetPhoto('${escapeHtml(preset.url)}')"
                      class="px-2 py-1 rounded-lg bg-amber-100/80 hover:bg-amber-200 text-[10px] font-semibold text-amber-900"
                    >
                      + ${escapeHtml(preset.label)}
                    </button>
                  `
                ).join('')}
              </div>
            </div>
          </div>

          <div id="inline-photo-preview-box" class="${state.inlinePhotoFormState.imageUrl ? 'flex' : 'hidden'} items-center gap-3 bg-amber-50 p-2.5 rounded-2xl border border-amber-200">
            <img id="inline-photo-preview-img" src="${escapeHtml(state.inlinePhotoFormState.imageUrl)}" alt="Xem trước" class="w-16 h-16 rounded-xl object-cover" />
            <div class="text-xs text-amber-950 font-semibold flex-1">
              Ảnh đã sẵn sàng để lưu vào tiểu sử của ${escapeHtml(member.name)}!
            </div>
            <button type="button" onclick="selectInlinePresetPhoto('')" class="text-xs text-rose-600 font-bold px-2">
              Xóa
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Tiêu đề kỷ niệm *
              </label>
              <input
                type="text"
                required
                value="${escapeHtml(state.inlinePhotoFormState.caption)}"
                oninput="updateInlinePhotoField('caption', this.value)"
                placeholder="VD: Hôm đi ăn chè cùng ${escapeHtml(member.nickname || member.name)}..."
                class="w-full px-3.5 py-2 rounded-xl border border-amber-200 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Chủ đề kỷ niệm
              </label>
              <select
                onchange="updateInlinePhotoField('category', this.value)"
                class="w-full px-3.5 py-2 rounded-xl border border-amber-200 text-xs bg-white focus:outline-none"
              >
                ${PHOTO_CATEGORIES.filter((c) => c !== 'Tất cả')
                  .map(
                    (c) => `
                    <option value="${escapeHtml(c)}" ${state.inlinePhotoFormState.category === c ? 'selected' : ''}>
                      ${escapeHtml(c)}
                    </option>
                  `
                  )
                  .join('')}
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">
              Câu chuyện đằng sau bức ảnh này
            </label>
            <textarea
              rows="2"
              oninput="updateInlinePhotoField('story', this.value)"
              placeholder="Kể lại hoàn cảnh ra đời bức ảnh này để sau này đọc lại vẫn bật cười nhé..."
              class="w-full px-3.5 py-2 rounded-xl border border-amber-200 text-xs focus:outline-none focus:border-amber-500"
            >${escapeHtml(state.inlinePhotoFormState.story)}</textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Ngày chụp</label>
              <input
                type="text"
                value="${escapeHtml(state.inlinePhotoFormState.date)}"
                oninput="updateInlinePhotoField('date', this.value)"
                placeholder="DD/MM/YYYY"
                class="w-full px-3.5 py-2 rounded-xl border border-amber-200 text-xs"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Người đăng ảnh</label>
              <input
                type="text"
                value="${escapeHtml(state.inlinePhotoFormState.uploadedBy)}"
                oninput="updateInlinePhotoField('uploadedBy', this.value)"
                placeholder="Tên của bạn..."
                class="w-full px-3.5 py-2 rounded-xl border border-amber-200 text-xs"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">
              Có bạn nào xuất hiện chung trong bức ảnh này nữa không? (Sẽ hiển thị trong cả tiểu sử của bạn đó)
            </label>
            <div class="flex flex-wrap gap-1.5">
              ${state.members
                .filter((m) => m.id !== member.id)
                .map((other) => {
                  const selected = state.inlinePhotoFormState.coTaggedIds.includes(other.id);
                  return `
                    <button
                      type="button"
                      onclick="toggleInlineCoTag('${escapeHtml(other.id)}')"
                      class="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition ${
                        selected
                          ? 'bg-indigo-950 text-amber-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-amber-100'
                      }"
                    >
                      <span>${escapeHtml(other.name)}</span>
                      ${selected ? '<i data-lucide="check" class="w-3 h-3"></i>' : ''}
                    </button>
                  `;
                })
                .join('')}
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onclick="toggleInlinePhotoForm(false)"
              class="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
            >
              Đóng
            </button>
            <button
              type="submit"
              class="px-5 py-2 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <i data-lucide="camera" class="w-4 h-4"></i>
              <span>Lưu Ảnh Vào Tiểu Sử Của ${escapeHtml(shortFirstName)}</span>
            </button>
          </div>
        </form>
      `
      : '';

    const memberPhotosGridHtml =
      memberPhotos.length === 0
        ? `
          <div class="bg-white rounded-3xl p-10 text-center border border-dashed border-amber-300 space-y-3">
            <i data-lucide="camera" class="w-10 h-10 text-amber-400 mx-auto"></i>
            <h4 class="text-base font-bold text-indigo-950">
              Tiểu sử của ${escapeHtml(member.name)} chưa có bức ảnh kỷ niệm nào
            </h4>
            <p class="text-xs text-slate-500 max-w-md mx-auto">
              Hãy bấm nút bên dưới để tải lên những bức ảnh đáng nhớ, ảnh chụp chung hoặc khoảnh khắc hài hước của ${escapeHtml(member.name)} nhé!
            </p>
            <button
              onclick="toggleInlinePhotoForm(true)"
              class="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow"
            >
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>Thêm ảnh kỷ niệm đầu tiên cho ${escapeHtml(member.name)}</span>
            </button>
          </div>
        `
        : `
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            ${memberPhotos
              .map(
                (photo) => `
              <div
                onclick="openLightbox('${escapeHtml(photo.id)}')"
                class="group cursor-pointer bg-white p-3.5 rounded-2xl border border-amber-200/80 shadow-sm hover:shadow-xl transition flex flex-col justify-between"
              >
                <div>
                  <div class="relative h-48 rounded-xl overflow-hidden bg-slate-100 mb-3">
                    <img
                      src="${escapeHtml(photo.imageUrl)}"
                      alt="${escapeHtml(photo.caption)}"
                      onerror="this.src='https://placehold.co/600x400/FEF3C7/78350F?text=Anh+Ky+Niem'"
                      class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <span class="absolute top-2 left-2 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-950/80 text-amber-200">
                      ${escapeHtml(photo.category)}
                    </span>
                    <button
                      onclick="event.stopPropagation(); handleLikePhoto('${escapeHtml(photo.id)}')"
                      class="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-white/90 text-rose-600 text-xs font-bold flex items-center gap-1 shadow"
                    >
                      <i data-lucide="heart" class="w-3 h-3 fill-rose-500 text-rose-500"></i>
                      <span>${photo.likes || 0}</span>
                    </button>
                  </div>

                  <div class="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>📅 ${escapeHtml(photo.date)}</span>
                    <span>Đăng bởi: ${escapeHtml(photo.uploadedBy)}</span>
                  </div>

                  <h5 class="font-bold text-indigo-950 text-sm mb-1">
                    ${escapeHtml(photo.caption)}
                  </h5>
                  ${
                    photo.story
                      ? `<p class="text-xs text-slate-600 line-clamp-2 leading-relaxed">${escapeHtml(photo.story)}</p>`
                      : ''
                  }
                </div>

                <div class="pt-3 mt-3 border-t border-amber-100 flex items-center justify-between text-[11px] text-amber-800 font-semibold">
                  <span class="inline-flex items-center gap-1">
                    <i data-lucide="maximize-2" class="w-3 h-3"></i>
                    Bấm để phóng to
                  </span>
                  <button
                    onclick="event.stopPropagation(); confirmDeletePhoto('${escapeHtml(photo.id)}')"
                    class="text-slate-300 hover:text-rose-600 p-1"
                    title="Xóa ảnh này"
                  >
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        `;

    rightColumnContent = `
      <div class="space-y-5">
        ${inlineFormHtml}
        ${memberPhotosGridHtml}
      </div>
    `;
  } else {
    // SubTab = notes
    const notesListHtml = (member.notes || [])
      .map(
        (note) => `
        <div class="bg-[#FFFBEB] p-4 rounded-2xl border border-amber-200 shadow-sm flex flex-col justify-between space-y-3">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 rounded-full bg-amber-200/70 text-amber-950 text-[11px] font-bold">
                ${escapeHtml(note.sticker)}
              </span>
              <span class="text-[11px] text-slate-400">${escapeHtml(note.createdAt)}</span>
            </div>
            <p class="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
              “${escapeHtml(note.content)}”
            </p>
          </div>
          <div class="text-xs font-bold text-indigo-950 pt-2 border-t border-amber-200/50">
            — Người viết: ${escapeHtml(note.author)}
          </div>
        </div>
      `
      )
      .join('');

    rightColumnContent = `
      <div class="space-y-5">
        <form onsubmit="submitMemberNoteForm(event)" class="bg-white p-5 rounded-3xl border border-amber-200/80 shadow-sm space-y-3.5">
          <h4 class="text-sm font-black text-indigo-950 flex items-center gap-2">
            <i data-lucide="message-square-heart" class="w-4 h-4 text-rose-500"></i>
            <span>Viết Lưu Bút Gửi Đến ${escapeHtml(member.name)}</span>
          </h4>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              id="note-author-input"
              type="text"
              placeholder="Tên hoặc biệt danh của bạn..."
              class="px-3.5 py-2 rounded-xl border border-amber-200 text-xs focus:outline-none focus:border-amber-500"
            />
            <select
              id="note-sticker-select"
              class="px-3.5 py-2 rounded-xl border border-amber-200 text-xs bg-amber-50/50 font-semibold text-amber-950 focus:outline-none"
            >
              ${STICKER_OPTIONS.map(
                (st) => `<option value="${escapeHtml(st)}">Nhãn dán: ${escapeHtml(st)}</option>`
              ).join('')}
            </select>
          </div>

          <textarea
            id="note-content-input"
            rows="3"
            required
            placeholder="Gửi những lời chúc chân thành hoặc kỷ niệm khó quên của bạn với ${escapeHtml(member.name)}..."
            class="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 text-xs focus:outline-none focus:border-amber-500"
          ></textarea>

          <div class="flex justify-end">
            <button
              type="submit"
              class="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition"
            >
              <i data-lucide="send" class="w-3.5 h-3.5"></i>
              <span>Dán Lưu Bút Vào Tiểu Sử</span>
            </button>
          </div>
        </form>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${notesListHtml}
        </div>
      </div>
    `;
  }

  root.innerHTML = `
    <div
      onclick="closeMemberProfile()"
      class="fixed inset-0 z-50 bg-indigo-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <div
        onclick="event.stopPropagation()"
        class="bg-[#FDFBF7] rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-amber-200 overflow-hidden my-auto"
      >
        <!-- Thanh công cụ trên cùng của sổ tiểu sử -->
        <div class="bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-950 text-amber-50 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 shrink-0">
          <div class="flex items-center gap-2 sm:gap-3">
            <i data-lucide="book-open" class="w-5 h-5 text-amber-400 shrink-0"></i>
            <span class="text-xs sm:text-sm font-bold tracking-wide">
              Trang Tiểu Sử & Kho Kỷ Niệm Của: <strong class="text-amber-300">${escapeHtml(member.name)}</strong>
            </span>
          </div>

          <div class="flex items-center gap-2">
            ${
              state.members.length > 1
                ? `
                <div class="hidden sm:flex items-center gap-1 mr-2">
                  <button
                    onclick="switchProfileMember('${escapeHtml(prevMember.id)}')"
                    class="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs flex items-center gap-1 transition"
                    title="Lật sang ${escapeHtml(prevMember.name)}"
                  >
                    <i data-lucide="chevron-left" class="w-3.5 h-3.5"></i>
                    <span>Bạn trước</span>
                  </button>
                  <button
                    onclick="switchProfileMember('${escapeHtml(nextMember.id)}')"
                    class="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs flex items-center gap-1 transition"
                    title="Lật sang ${escapeHtml(nextMember.name)}"
                  >
                    <span>Bạn tiếp</span>
                    <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              `
                : ''
            }

            <button
              onclick="openMemberModal('${escapeHtml(member.id)}')"
              class="px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 text-xs font-bold flex items-center gap-1 transition"
            >
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
              <span class="hidden sm:inline">Sửa tiểu sử</span>
            </button>

            <button
              onclick="confirmDeleteMember('${escapeHtml(member.id)}')"
              class="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-200 transition"
              title="Xóa hồ sơ này"
            >
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>

            <button
              onclick="closeMemberProfile()"
              class="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
            >
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>
        </div>

        <!-- Nội dung cuộn bên trong: Bố cục 2 cột -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-7">
          <!-- CỘT TRÁI (5 PHẦN) -->
          <div class="lg:col-span-5 space-y-5">
            <div class="bg-white p-4 rounded-3xl shadow-md border border-amber-200/80 relative">
              <div class="relative h-72 rounded-2xl overflow-hidden bg-amber-50">
                <img
                  src="${escapeHtml(member.avatar)}"
                  alt="${escapeHtml(member.name)}"
                  onerror="this.src='${fallbackAvatar}'"
                  class="w-full h-full object-cover"
                />
                <div class="absolute top-3 left-3 flex gap-1.5">
                  <span class="px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-indigo-950 shadow">
                    ${escapeHtml(member.group)}
                  </span>
                  <span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-indigo-950 shadow">
                    ${escapeHtml(member.role)}
                  </span>
                </div>
              </div>

              <div class="pt-4 text-center space-y-1">
                <div class="text-xs font-bold uppercase tracking-widest text-amber-700">
                  Biệt danh: “${escapeHtml(member.nickname || 'Bạn hiền')}”
                </div>
                <h2 class="text-2xl font-black text-indigo-950">${escapeHtml(member.name)}</h2>
                <p class="text-xs sm:text-sm text-amber-900 italic font-medium pt-1">
                  “${escapeHtml(member.quote)}”
                </p>
              </div>
            </div>

            <div class="bg-white p-5 rounded-3xl shadow-sm border border-amber-200/70 space-y-4">
              <h3 class="text-sm font-black uppercase tracking-wider text-indigo-950 flex items-center gap-2">
                <i data-lucide="sparkles" class="w-4 h-4 text-amber-500"></i>
                <span>Tiểu Sử & Ký Ức Ở Lớp</span>
              </h3>
              <p class="text-sm text-slate-700 leading-relaxed whitespace-pre-line">${escapeHtml(member.bio)}</p>

              <div class="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div class="bg-amber-50/70 p-3 rounded-2xl border border-amber-100">
                  <span class="text-slate-400 block mb-0.5">🎂 Ngày sinh</span>
                  <strong class="text-indigo-950">${escapeHtml(member.birthday)}</strong>
                </div>
                <div class="bg-amber-50/70 p-3 rounded-2xl border border-amber-100">
                  <span class="text-slate-400 block mb-0.5">✨ Cung hoàng đạo</span>
                  <strong class="text-indigo-950">${escapeHtml(member.zodiac || 'Bí ẩn')}</strong>
                </div>
              </div>

              <div class="bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-100 text-xs space-y-1">
                <span class="text-indigo-600 font-bold flex items-center gap-1.5">
                  <i data-lucide="graduation-cap" class="w-4 h-4"></i>
                  Ước mơ & Mục tiêu tương lai:
                </span>
                <p class="text-indigo-950 font-semibold text-sm">${escapeHtml(member.dream)}</p>
              </div>

              ${hobbiesHtml}
              ${funFactHtml}
            </div>
          </div>

          <!-- CỘT PHẢI (7 PHẦN) -->
          <div class="lg:col-span-7 flex flex-col space-y-5">
            <div class="bg-white p-2 rounded-2xl border border-amber-200/80 flex items-center justify-between gap-2 flex-wrap">
              <div class="flex items-center gap-1.5">
                <button
                  onclick="setProfileSubTab('photos')"
                  class="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
                    state.profileSubTab === 'photos'
                      ? 'bg-indigo-950 text-amber-300 shadow'
                      : 'text-slate-600 hover:bg-amber-50'
                  }"
                >
                  <i data-lucide="camera" class="w-4 h-4"></i>
                  <span>Kho Ảnh Kỷ Niệm Của ${escapeHtml(shortFirstName)}</span>
                  <span class="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs">
                    ${memberPhotos.length}
                  </span>
                </button>

                <button
                  onclick="setProfileSubTab('notes')"
                  class="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
                    state.profileSubTab === 'notes'
                      ? 'bg-indigo-950 text-amber-300 shadow'
                      : 'text-slate-600 hover:bg-amber-50'
                  }"
                >
                  <i data-lucide="message-square-heart" class="w-4 h-4"></i>
                  <span>Lưu Bút Gửi Bạn</span>
                  <span class="px-2 py-0.5 rounded-full bg-rose-400/20 text-rose-300 text-xs">
                    ${(member.notes || []).length}
                  </span>
                </button>
              </div>

              ${
                state.profileSubTab === 'photos'
                  ? `
                  <button
                    onclick="toggleInlinePhotoForm(${!state.showInlinePhotoForm})"
                    class="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                  >
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    <span>
                      ${
                        state.showInlinePhotoForm
                          ? 'Đóng khung tải ảnh'
                          : 'Lưu ảnh vào tiểu sử ' + escapeHtml(shortFirstName)
                      }
                    </span>
                  </button>
                `
                  : ''
              }
            </div>

            ${rightColumnContent}
          </div>
        </div>
      </div>
    </div>
  `;

  refreshIcons();
}

// ==========================================
// RENDER LIGHTBOX XEM ẢNH TOÀN MÀN HÌNH
// ==========================================
function renderLightboxModal() {
  const root = document.getElementById('lightbox-modal-root');
  const photo = state.photos.find((p) => p.id === state.lightboxPhotoId);
  if (!photo) {
    root.classList.add('hidden');
    root.innerHTML = '';
    return;
  }

  root.classList.remove('hidden');
  const taggedPeople = state.members.filter(
    (m) =>
      m.id === photo.memberId ||
      (Array.isArray(photo.taggedMemberIds) && photo.taggedMemberIds.includes(m.id))
  );

  root.innerHTML = `
    <div
      onclick="closeLightbox()"
      class="fixed inset-0 z-[80] bg-indigo-950/90 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        onclick="event.stopPropagation()"
        class="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 max-h-[90vh]"
      >
        <div class="md:col-span-7 bg-slate-950 flex items-center justify-center max-h-[55vh] md:max-h-[85vh] overflow-hidden relative">
          <img
            src="${escapeHtml(photo.imageUrl)}"
            alt="${escapeHtml(photo.caption)}"
            class="w-full h-full object-contain"
          />
        </div>

        <div class="md:col-span-5 p-6 flex flex-col justify-between overflow-y-auto">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                ${escapeHtml(photo.category)}
              </span>
              <button
                onclick="closeLightbox()"
                class="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <i data-lucide="x" class="w-4 h-4"></i>
              </button>
            </div>

            <h3 class="text-xl font-black text-indigo-950">
              ${escapeHtml(photo.caption)}
            </h3>

            <div class="text-xs text-slate-500 flex items-center gap-3">
              <span>📅 Ngày chụp: ${escapeHtml(photo.date)}</span>
              <span>•</span>
              <span>Người đăng: ${escapeHtml(photo.uploadedBy)}</span>
            </div>

            ${
              photo.story
                ? `<div class="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/70 text-sm text-slate-700 leading-relaxed">${escapeHtml(photo.story)}</div>`
                : ''
            }

            <div class="space-y-2 pt-2">
              <div class="text-xs font-bold uppercase tracking-wider text-slate-400">
                Các bạn xuất hiện trong kỷ niệm này:
              </div>
              <div class="flex flex-wrap gap-2">
                ${taggedPeople
                  .map(
                    (person) => `
                    <button
                      onclick="closeLightbox(); openMemberProfile('${escapeHtml(person.id)}', 'photos', false)"
                      class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-indigo-950 text-xs font-bold transition"
                    >
                      <img
                        src="${escapeHtml(person.avatar)}"
                        alt="${escapeHtml(person.name)}"
                        class="w-5 h-5 rounded-full object-cover"
                      />
                      <span>${escapeHtml(person.name)}</span>
                    </button>
                  `
                  )
                  .join('')}
              </div>
            </div>
          </div>

          <div class="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              onclick="handleLikePhoto('${escapeHtml(photo.id)}')"
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-bold transition"
            >
              <i data-lucide="heart" class="w-4 h-4 fill-rose-500 text-rose-500"></i>
              <span>Thả tim (${photo.likes || 0})</span>
            </button>

            <button
              onclick="confirmDeletePhoto('${escapeHtml(photo.id)}')"
              class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-600 transition"
            >
              <i data-lucide="trash-2" class="w-4 h-4"></i>
              <span>Xóa ảnh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  refreshIcons();
}

// ==========================================
// CÁC HÀM TƯƠNG TÁC GẮN VÀO WINDOW
// ==========================================
window.switchMainTab = (tab) => {
  state.activeTab = tab;
  renderAll();
};

window.handleSearchInput = (val) => {
  state.searchQuery = val;
  const clearBtn = document.getElementById('clear-search-btn');
  if (val.trim()) {
    clearBtn.classList.remove('hidden');
  } else {
    clearBtn.classList.add('hidden');
  }
  renderMembersSection();
  refreshIcons();
};

window.clearSearch = () => {
  state.searchQuery = '';
  const input = document.getElementById('member-search-input');
  if (input) input.value = '';
  document.getElementById('clear-search-btn').classList.add('hidden');
  renderMembersSection();
  refreshIcons();
};

window.selectGroupFilter = (group) => {
  state.selectedGroup = group;
  renderMembersSection();
  refreshIcons();
};

window.resetMemberFilters = () => {
  state.searchQuery = '';
  state.selectedGroup = 'Tất cả';
  const input = document.getElementById('member-search-input');
  if (input) input.value = '';
  document.getElementById('clear-search-btn').classList.add('hidden');
  renderMembersSection();
  refreshIcons();
};

window.selectPhotoCategory = (cat) => {
  state.selectedPhotoCategory = cat;
  renderGallerySection();
  refreshIcons();
};

window.handlePhotoMemberFilterChange = (memberId) => {
  state.selectedPhotoMemberFilter = memberId;
  renderGallerySection();
  refreshIcons();
};

// --- Modal Chi tiết Tiểu sử ---
window.openMemberProfile = (memberId, subTab = 'photos', openPhotoForm = false) => {
  state.activeMemberId = memberId;
  state.profileSubTab = subTab;
  state.showInlinePhotoForm = openPhotoForm;
  state.inlinePhotoFormState = {
    imageUrl: '',
    caption: '',
    story: '',
    date: new Date().toLocaleDateString('vi-VN'),
    category: 'Khoảnh khắc trên lớp',
    uploadedBy: '',
    coTaggedIds: []
  };
  renderProfileModal();
};

window.closeMemberProfile = () => {
  state.activeMemberId = null;
  state.showInlinePhotoForm = false;
  renderProfileModal();
};

window.switchProfileMember = (memberId) => {
  state.activeMemberId = memberId;
  state.showInlinePhotoForm = false;
  renderProfileModal();
};

window.setProfileSubTab = (subTab) => {
  state.profileSubTab = subTab;
  renderProfileModal();
};

window.toggleInlinePhotoForm = (show) => {
  state.showInlinePhotoForm = show;
  renderProfileModal();
};

window.updateInlinePhotoField = (field, value) => {
  state.inlinePhotoFormState[field] = value;
  if (field === 'imageUrl') {
    const box = document.getElementById('inline-photo-preview-box');
    const img = document.getElementById('inline-photo-preview-img');
    if (box && img) {
      if (value.trim()) {
        img.src = value.trim();
        box.classList.remove('hidden');
        box.classList.add('flex');
      } else {
        box.classList.add('hidden');
        box.classList.remove('flex');
      }
    }
  }
};

window.selectInlinePresetPhoto = (url) => {
  state.inlinePhotoFormState.imageUrl = url;
  renderProfileModal();
};

window.handleInlinePhotoFileChange = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const statusEl = document.getElementById('inline-upload-status');
  if (statusEl) statusEl.textContent = 'Đang xử lý ảnh...';
  try {
    const compressed = await compressImageFile(file, 720, 0.68);
    state.inlinePhotoFormState.imageUrl = compressed;
    renderProfileModal();
  } catch (err) {
    console.error('Lỗi nén ảnh:', err);
  }
};

window.toggleInlineCoTag = (otherId) => {
  const list = state.inlinePhotoFormState.coTaggedIds;
  if (list.includes(otherId)) {
    state.inlinePhotoFormState.coTaggedIds = list.filter((id) => id !== otherId);
  } else {
    state.inlinePhotoFormState.coTaggedIds = [...list, otherId];
  }
  renderProfileModal();
};

window.submitInlinePhotoForm = async (event) => {
  event.preventDefault();
  const f = state.inlinePhotoFormState;
  if (!f.imageUrl.trim() || !f.caption.trim()) return;
  await saveMemoryPhoto({
    memberId: state.activeMemberId,
    taggedMemberIds: [state.activeMemberId, ...f.coTaggedIds],
    imageUrl: f.imageUrl.trim(),
    caption: f.caption.trim(),
    story: f.story.trim(),
    date: f.date,
    category: f.category,
    uploadedBy: f.uploadedBy.trim() || 'Bạn cùng lớp'
  });
  state.showInlinePhotoForm = false;
  renderAll();
};

window.submitMemberNoteForm = async (event) => {
  event.preventDefault();
  const author = document.getElementById('note-author-input')?.value || '';
  const sticker = document.getElementById('note-sticker-select')?.value || STICKER_OPTIONS[0];
  const content = document.getElementById('note-content-input')?.value || '';
  if (!content.trim() || !state.activeMemberId) return;

  const target = state.members.find((m) => m.id === state.activeMemberId);
  if (!target) return;

  const newNote = {
    id: `note-${Date.now()}`,
    author: author.trim() || 'Người bạn giấu tên',
    content: content.trim(),
    sticker,
    createdAt: new Date().toLocaleDateString('vi-VN')
  };

  const updatedNotes = [newNote, ...(target.notes || [])];
  state.members = state.members.map((m) =>
    m.id === target.id ? { ...m, notes: updatedNotes } : m
  );

  if (state.user && db) {
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'class_members', target.id), {
        notes: updatedNotes
      });
    } catch (err) {
      console.error('Lỗi gửi lưu bút:', err);
    }
  }

  showToast(`Đã gửi dòng lưu bút vào hồ sơ của ${target.name}!`);
  renderAll();
};

// --- Lưu & Thả tim & Xóa Ảnh ---
async function saveMemoryPhoto(photoData) {
  const id = `photo-${Date.now()}`;
  const rotations = [-2, -1.5, -1, 1, 1.5, 2];
  const randomRotation = rotations[Math.floor(Math.random() * rotations.length)];

  const taggedSet = new Set(photoData.taggedMemberIds || []);
  if (photoData.memberId && photoData.memberId !== 'all') {
    taggedSet.add(photoData.memberId);
  }

  const newPhoto = {
    id,
    memberId: photoData.memberId || 'all',
    taggedMemberIds: Array.from(taggedSet),
    imageUrl: photoData.imageUrl,
    caption: photoData.caption,
    story: photoData.story || '',
    date: photoData.date || new Date().toLocaleDateString('vi-VN'),
    category: photoData.category || 'Khoảnh khắc trên lớp',
    uploadedBy: photoData.uploadedBy || 'Bạn cùng lớp',
    likes: 1,
    rotation: randomRotation,
    createdAt: Date.now()
  };

  state.photos = [newPhoto, ...state.photos];

  if (state.user && db) {
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'class_photos', id), newPhoto);
    } catch (err) {
      console.error('Lỗi lưu ảnh kỷ niệm:', err);
    }
  }

  const targetMember = state.members.find((m) => m.id === newPhoto.memberId);
  showToast(
    targetMember
      ? `Đã lưu ảnh kỷ niệm vào tiểu sử của ${targetMember.name}!`
      : 'Đã thêm bức ảnh mới vào kho kỷ niệm lớp!'
  );
}

window.handleLikePhoto = async (photoId) => {
  const photo = state.photos.find((p) => p.id === photoId);
  if (!photo) return;
  const updatedLikes = (photo.likes || 0) + 1;
  state.photos = state.photos.map((p) =>
    p.id === photoId ? { ...p, likes: updatedLikes } : p
  );
  renderAll();

  if (state.user && db) {
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'class_photos', photoId), {
        likes: updatedLikes
      });
    } catch (err) {
      console.error('Lỗi thả tim ảnh:', err);
    }
  }
};

// --- Lightbox ---
window.openLightbox = (photoId) => {
  state.lightboxPhotoId = photoId;
  renderLightboxModal();
};

window.closeLightbox = () => {
  state.lightboxPhotoId = null;
  renderLightboxModal();
};

// --- Modal Thêm / Sửa Thành Viên ---
window.openMemberModal = (memberId = null) => {
  state.editingMemberId = memberId;
  const initialData = memberId ? state.members.find((m) => m.id === memberId) : null;
  state.memberFormAvatar =
    initialData?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';

  const root = document.getElementById('member-form-modal-root');
  root.classList.remove('hidden');

  const hobbiesText = Array.isArray(initialData?.hobbies)
    ? initialData.hobbies.join(', ')
    : '';

  root.innerHTML = `
    <div
      onclick="closeMemberModal()"
      class="fixed inset-0 z-[70] bg-indigo-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        onclick="event.stopPropagation()"
        class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-amber-200 max-h-[90vh] overflow-y-auto"
      >
        <div class="flex items-center justify-between pb-4 border-b border-amber-100">
          <h3 class="text-lg font-black text-indigo-950">
            ${
              initialData
                ? 'Chỉnh Sửa Tiểu Sử: ' + escapeHtml(initialData.name)
                : 'Thêm Thành Viên Mới Vào Sổ Kỷ Yếu'
            }
          </h3>
          <button onclick="closeMemberModal()" class="p-1.5 rounded-full hover:bg-slate-100">
            <i data-lucide="x" class="w-5 h-5 text-slate-500"></i>
          </button>
        </div>

        <form onsubmit="submitMemberForm(event)" class="space-y-4 pt-4 text-xs sm:text-sm">
          <div class="flex items-center gap-4 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/70">
            <img
              id="member-form-avatar-preview"
              src="${escapeHtml(state.memberFormAvatar)}"
              alt="Avatar"
              class="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow"
            />
            <div class="flex-1 space-y-2">
              <div class="flex items-center gap-2 flex-wrap">
                <label class="cursor-pointer px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold inline-flex items-center gap-1.5">
                  <i data-lucide="upload" class="w-3.5 h-3.5"></i>
                  <span id="member-avatar-upload-text">Tải ảnh chân dung từ máy</span>
                  <input type="file" accept="image/*" onchange="handleMemberAvatarUpload(event)" class="hidden" />
                </label>
              </div>
              <input
                id="member-form-avatar-input"
                type="text"
                value="${escapeHtml(state.memberFormAvatar)}"
                oninput="updateMemberFormAvatarPreview(this.value)"
                placeholder="Hoặc dán link ảnh chân dung..."
                class="w-full px-3 py-1.5 rounded-xl border border-amber-200 text-xs"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Họ và tên *</label>
              <input
                id="mf-name"
                type="text"
                required
                value="${escapeHtml(initialData?.name || '')}"
                placeholder="VD: Nguyễn Minh Khôi"
                class="w-full px-3.5 py-2 rounded-xl border border-amber-200"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Biệt danh ở lớp</label>
              <input
                id="mf-nickname"
                type="text"
                value="${escapeHtml(initialData?.nickname || '')}"
                placeholder="VD: Khôi Ngơ"
                class="w-full px-3.5 py-2 rounded-xl border border-amber-200"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Tổ</label>
              <select id="mf-group" class="w-full px-3.5 py-2 rounded-xl border border-amber-200 bg-white">
                ${['Tổ 1', 'Tổ 2', 'Tổ 3', 'Tổ 4']
                  .map(
                    (g) => `
                    <option value="${g}" ${(initialData?.group || 'Tổ 1') === g ? 'selected' : ''}>${g}</option>
                  `
                  )
                  .join('')}
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Chức vụ trong lớp</label>
              <input
                id="mf-role"
                type="text"
                value="${escapeHtml(initialData?.role || 'Thành Viên')}"
                placeholder="Lớp Trưởng, Thành Viên..."
                class="w-full px-3.5 py-2 rounded-xl border border-amber-200"
              />
            </div>
            <div class="flex items-end pb-2">
              <label class="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-indigo-950">
                <input
                  id="mf-isleader"
                  type="checkbox"
                  ${initialData?.isLeader ? 'checked' : ''}
                  class="rounded text-amber-500"
                />
                <span>Thuộc Ban Cán Sự Lớp</span>
              </label>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Ngày sinh</label>
              <input
                id="mf-birthday"
                type="text"
                value="${escapeHtml(initialData?.birthday || '01/01/2008')}"
                placeholder="14/05/2008"
                class="w-full px-3.5 py-2 rounded-xl border border-amber-200"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Cung hoàng đạo</label>
              <input
                id="mf-zodiac"
                type="text"
                value="${escapeHtml(initialData?.zodiac || '')}"
                placeholder="Kim Ngưu, Xử Nữ..."
                class="w-full px-3.5 py-2 rounded-xl border border-amber-200"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">
              Ước mơ / Trường Đại học mục tiêu
            </label>
            <input
              id="mf-dream"
              type="text"
              value="${escapeHtml(initialData?.dream || '')}"
              placeholder="VD: ĐH Bách Khoa TP.HCM - Khoa học Máy tính"
              class="w-full px-3.5 py-2 rounded-xl border border-amber-200"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">
              Câu nói thương hiệu
            </label>
            <input
              id="mf-quote"
              type="text"
              value="${escapeHtml(initialData?.quote || '')}"
              placeholder="Câu cửa miệng mà cả lớp ai cũng nhớ..."
              class="w-full px-3.5 py-2 rounded-xl border border-amber-200"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">
              Tiểu sử & Tính cách
            </label>
            <textarea
              id="mf-bio"
              rows="3"
              placeholder="Viết đôi dòng giới thiệu về bạn ấy, những kỷ niệm đáng nhớ nhất ở lớp..."
              class="w-full px-3.5 py-2 rounded-xl border border-amber-200"
            >${escapeHtml(initialData?.bio || '')}</textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Sở thích (cách nhau bằng dấu phẩy)
              </label>
              <input
                id="mf-hobbies"
                type="text"
                value="${escapeHtml(hobbiesText)}"
                placeholder="Đàn guitar, Bóng rổ, Trà sữa..."
                class="w-full px-3.5 py-2 rounded-xl border border-amber-200"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Bí mật vui / Fun Fact
              </label>
              <input
                id="mf-funfact"
                type="text"
                value="${escapeHtml(initialData?.funFact || '')}"
                placeholder="Một tật xấu đáng yêu hoặc kỷ niệm hài hước..."
                class="w-full px-3.5 py-2 rounded-xl border border-amber-200"
              />
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-amber-100">
            <button
              type="button"
              onclick="closeMemberModal()"
              class="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
            >
              Hủy
            </button>
            <button
              type="submit"
              class="px-5 py-2.5 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-amber-300 text-xs font-bold shadow-md"
            >
              Lưu Hồ Sơ Thành Viên
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  refreshIcons();
};

window.closeMemberModal = () => {
  const root = document.getElementById('member-form-modal-root');
  root.classList.add('hidden');
  root.innerHTML = '';
  state.editingMemberId = null;
};

window.updateMemberFormAvatarPreview = (url) => {
  state.memberFormAvatar = url;
  const img = document.getElementById('member-form-avatar-preview');
  if (img) img.src = url;
};

window.handleMemberAvatarUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const textEl = document.getElementById('member-avatar-upload-text');
  if (textEl) textEl.textContent = 'Đang nén ảnh...';
  try {
    const compressed = await compressImageFile(file, 600, 0.7);
    state.memberFormAvatar = compressed;
    const img = document.getElementById('member-form-avatar-preview');
    const input = document.getElementById('member-form-avatar-input');
    if (img) img.src = compressed;
    if (input) input.value = compressed;
  } catch (err) {
    console.error('Lỗi tải ảnh đại diện:', err);
  } finally {
    if (textEl) textEl.textContent = 'Tải ảnh chân dung từ máy';
  }
};

window.submitMemberForm = async (event) => {
  event.preventDefault();
  const name = document.getElementById('mf-name')?.value.trim();
  if (!name) return;

  const isEdit = Boolean(state.editingMemberId);
  const existing = isEdit ? state.members.find((m) => m.id === state.editingMemberId) : null;
  const id = isEdit ? existing.id : `mem-${Date.now()}`;

  const hobbiesRaw = document.getElementById('mf-hobbies')?.value || '';
  const hobbies = hobbiesRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const payload = {
    ...(existing || {}),
    id,
    name,
    nickname: document.getElementById('mf-nickname')?.value.trim() || '',
    group: document.getElementById('mf-group')?.value || 'Tổ 1',
    role: document.getElementById('mf-role')?.value.trim() || 'Thành Viên',
    isLeader: Boolean(document.getElementById('mf-isleader')?.checked),
    birthday: document.getElementById('mf-birthday')?.value.trim() || '',
    zodiac: document.getElementById('mf-zodiac')?.value.trim() || '',
    dream: document.getElementById('mf-dream')?.value.trim() || '',
    quote: document.getElementById('mf-quote')?.value.trim() || '',
    bio: document.getElementById('mf-bio')?.value.trim() || '',
    hobbies,
    funFact: document.getElementById('mf-funfact')?.value.trim() || '',
    avatar: document.getElementById('member-form-avatar-input')?.value.trim() || state.memberFormAvatar,
    notes: existing?.notes || [],
    createdAt: existing?.createdAt || Date.now()
  };

  if (isEdit) {
    state.members = state.members.map((m) => (m.id === id ? payload : m));
  } else {
    state.members = [...state.members, payload];
  }

  if (state.user && db) {
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'class_members', id), payload);
    } catch (err) {
      console.error('Lỗi lưu hồ sơ thành viên:', err);
    }
  }

  closeMemberModal();
  showToast(isEdit ? `Đã cập nhật tiểu sử của ${payload.name}!` : `Đã thêm ${payload.name} vào sổ kỷ yếu lớp!`);
  renderAll();
};

// --- Modal Đăng Ảnh Kỷ Niệm Chung ---
window.openAddPhotoModal = (preselectedMemberId = null) => {
  const defaultMemberId = preselectedMemberId || state.members[0]?.id || 'all';
  state.addPhotoModalState = {
    memberId: defaultMemberId,
    taggedMemberIds: preselectedMemberId ? [preselectedMemberId] : [],
    imageUrl: '',
    caption: '',
    story: '',
    date: new Date().toLocaleDateString('vi-VN'),
    category: 'Khoảnh khắc trên lớp',
    uploadedBy: ''
  };
  renderAddPhotoModal();
};

function renderAddPhotoModal() {
  const root = document.getElementById('add-photo-modal-root');
  root.classList.remove('hidden');
  const s = state.addPhotoModalState;

  root.innerHTML = `
    <div
      onclick="closeAddPhotoModal()"
      class="fixed inset-0 z-[70] bg-indigo-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        onclick="event.stopPropagation()"
        class="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-amber-200 max-h-[90vh] overflow-y-auto"
      >
        <div class="flex items-center justify-between pb-3 border-b border-amber-100">
          <h3 class="text-lg font-black text-indigo-950 flex items-center gap-2">
            <i data-lucide="camera" class="w-5 h-5 text-amber-500"></i>
            <span>Đăng Ảnh Kỷ Niệm Vào Tiểu Sử & Lớp</span>
          </h3>
          <button onclick="closeAddPhotoModal()" class="p-1 rounded-full hover:bg-slate-100">
            <i data-lucide="x" class="w-5 h-5 text-slate-500"></i>
          </button>
        </div>

        <form onsubmit="submitAddPhotoModal(event)" class="space-y-4 pt-4 text-xs sm:text-sm">
          <div>
            <label class="block text-xs font-bold text-indigo-950 mb-1">
              Lưu bức ảnh này vào tiểu sử của bạn nào? *
            </label>
            <select
              onchange="updateAddPhotoField('memberId', this.value)"
              class="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50/70 font-bold text-indigo-950"
            >
              ${state.members
                .map(
                  (m) => `
                  <option value="${escapeHtml(m.id)}" ${s.memberId === m.id ? 'selected' : ''}>
                    📌 Lưu vào tiểu sử của: ${escapeHtml(m.name)} (${escapeHtml(m.nickname)})
                  </option>
                `
                )
                .join('')}
              <option value="all" ${s.memberId === 'all' ? 'selected' : ''}>🌟 Ảnh tập thể chung cả lớp</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-700">
              Chọn ảnh từ máy hoặc dán Link ảnh *
            </label>
            <label class="cursor-pointer flex flex-col items-center justify-center h-28 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/40 hover:bg-amber-50 transition p-3 text-center">
              <i data-lucide="upload" class="w-6 h-6 text-amber-600 mb-1"></i>
              <span id="modal-photo-upload-status" class="text-xs font-bold text-amber-950">
                Bấm để tải ảnh từ máy tính / điện thoại
              </span>
              <input type="file" accept="image/*" onchange="handleModalPhotoFileUpload(event)" class="hidden" />
            </label>

            <input
              type="text"
              value="${escapeHtml(s.imageUrl)}"
              oninput="updateAddPhotoField('imageUrl', this.value)"
              placeholder="Hoặc dán đường dẫn ảnh (https://...)"
              class="w-full px-3.5 py-2 rounded-xl border border-amber-200 text-xs"
            />
          </div>

          <div id="modal-photo-preview-box" class="${s.imageUrl ? 'flex' : 'hidden'} items-center gap-3 bg-amber-50 p-2.5 rounded-2xl border border-amber-200">
            <img id="modal-photo-preview-img" src="${escapeHtml(s.imageUrl)}" alt="Preview" class="w-16 h-16 rounded-xl object-cover" />
            <span class="text-xs font-bold text-amber-950 flex-1">
              Đã chọn ảnh kỷ niệm thành công!
            </span>
            <button type="button" onclick="clearModalPhotoPreview()" class="text-xs text-rose-600 font-bold">
              Đổi ảnh
            </button>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Tiêu đề bức ảnh *</label>
            <input
              type="text"
              required
              value="${escapeHtml(s.caption)}"
              oninput="updateAddPhotoField('caption', this.value)"
              placeholder="VD: Buổi chiều mưa cùng nhau giải đề Toán..."
              class="w-full px-3.5 py-2 rounded-xl border border-amber-200"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Câu chuyện kỷ niệm</label>
            <textarea
              rows="2"
              oninput="updateAddPhotoField('story', this.value)"
              placeholder="Ghi lại hoàn cảnh hoặc câu chuyện đáng nhớ của bức ảnh..."
              class="w-full px-3.5 py-2 rounded-xl border border-amber-200"
            >${escapeHtml(s.story)}</textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Chủ đề</label>
              <select
                onchange="updateAddPhotoField('category', this.value)"
                class="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white text-xs"
              >
                ${PHOTO_CATEGORIES.filter((c) => c !== 'Tất cả')
                  .map(
                    (c) => `
                    <option value="${escapeHtml(c)}" ${s.category === c ? 'selected' : ''}>${escapeHtml(c)}</option>
                  `
                  )
                  .join('')}
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Ngày chụp</label>
              <input
                type="text"
                value="${escapeHtml(s.date)}"
                oninput="updateAddPhotoField('date', this.value)"
                class="w-full px-3 py-2 rounded-xl border border-amber-200 text-xs"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Người đăng</label>
              <input
                type="text"
                value="${escapeHtml(s.uploadedBy)}"
                oninput="updateAddPhotoField('uploadedBy', this.value)"
                placeholder="Tên bạn..."
                class="w-full px-3 py-2 rounded-xl border border-amber-200 text-xs"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">
              Gắn thẻ thêm các bạn cùng xuất hiện trong ảnh:
            </label>
            <div class="flex flex-wrap gap-1.5">
              ${state.members
                .map((m) => {
                  const isSelected = s.taggedMemberIds.includes(m.id) || m.id === s.memberId;
                  return `
                    <button
                      type="button"
                      onclick="toggleModalPhotoTag('${escapeHtml(m.id)}')"
                      class="px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                        isSelected
                          ? 'bg-indigo-950 text-amber-300'
                          : 'bg-slate-100 text-slate-600'
                      }"
                    >
                      ${escapeHtml(m.name)}
                    </button>
                  `;
                })
                .join('')}
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-3 border-t border-amber-100">
            <button
              type="button"
              onclick="closeAddPhotoModal()"
              class="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
            >
              Hủy
            </button>
            <button
              type="submit"
              class="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md"
            >
              Đăng Ảnh Kỷ Niệm
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  refreshIcons();
}

window.closeAddPhotoModal = () => {
  const root = document.getElementById('add-photo-modal-root');
  root.classList.add('hidden');
  root.innerHTML = '';
};

window.updateAddPhotoField = (field, value) => {
  state.addPhotoModalState[field] = value;
  if (field === 'memberId') {
    renderAddPhotoModal();
  } else if (field === 'imageUrl') {
    const box = document.getElementById('modal-photo-preview-box');
    const img = document.getElementById('modal-photo-preview-img');
    if (box && img) {
      if (value.trim()) {
        img.src = value.trim();
        box.classList.remove('hidden');
        box.classList.add('flex');
      } else {
        box.classList.add('hidden');
        box.classList.remove('flex');
      }
    }
  }
};

window.clearModalPhotoPreview = () => {
  state.addPhotoModalState.imageUrl = '';
  renderAddPhotoModal();
};

window.handleModalPhotoFileUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const statusEl = document.getElementById('modal-photo-upload-status');
  if (statusEl) statusEl.textContent = 'Đang nén ảnh...';
  try {
    const compressed = await compressImageFile(file, 720, 0.68);
    state.addPhotoModalState.imageUrl = compressed;
    renderAddPhotoModal();
  } catch (err) {
    console.error('Lỗi nén ảnh:', err);
  }
};

window.toggleModalPhotoTag = (id) => {
  const s = state.addPhotoModalState;
  if (id === s.memberId) return;
  if (s.taggedMemberIds.includes(id)) {
    s.taggedMemberIds = s.taggedMemberIds.filter((item) => item !== id);
  } else {
    s.taggedMemberIds = [...s.taggedMemberIds, id];
  }
  renderAddPhotoModal();
};

window.submitAddPhotoModal = async (event) => {
  event.preventDefault();
  const s = state.addPhotoModalState;
  if (!s.imageUrl.trim() || !s.caption.trim()) return;
  await saveMemoryPhoto({
    memberId: s.memberId,
    taggedMemberIds: s.taggedMemberIds,
    imageUrl: s.imageUrl.trim(),
    caption: s.caption.trim(),
    story: s.story.trim(),
    date: s.date,
    category: s.category,
    uploadedBy: s.uploadedBy.trim() || 'Bạn cùng lớp'
  });
  closeAddPhotoModal();
  renderAll();
};

// --- Modal Chỉnh sửa Thông tin Lớp ---
window.openClassInfoModal = () => {
  const root = document.getElementById('class-info-modal-root');
  root.classList.remove('hidden');
  const info = state.classInfo;

  root.innerHTML = `
    <div
      onclick="closeClassInfoModal()"
      class="fixed inset-0 z-[70] bg-indigo-950/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onclick="event.stopPropagation()"
        class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-amber-200 space-y-4"
      >
        <div class="flex items-center justify-between border-b border-amber-100 pb-3">
          <h3 class="text-lg font-black text-indigo-950">Chỉnh Sửa Thông Tin Lớp</h3>
          <button onclick="closeClassInfoModal()" class="p-1 rounded-full hover:bg-slate-100">
            <i data-lucide="x" class="w-5 h-5 text-slate-500"></i>
          </button>
        </div>

        <form onsubmit="submitClassInfoModal(event)" class="space-y-3.5 text-xs sm:text-sm">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Tên trường</label>
            <input
              id="ci-school"
              type="text"
              value="${escapeHtml(info.school || '')}"
              class="w-full px-3.5 py-2 rounded-xl border border-amber-200"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Tên lớp & Niên khóa</label>
            <input
              id="ci-classname"
              type="text"
              value="${escapeHtml(info.className || '')}"
              class="w-full px-3.5 py-2 rounded-xl border border-amber-200"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Tiêu đề Kỷ Yếu</label>
            <input
              id="ci-title"
              type="text"
              value="${escapeHtml(info.title || '')}"
              class="w-full px-3.5 py-2 rounded-xl border border-amber-200"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Giáo viên chủ nhiệm</label>
            <input
              id="ci-teacher"
              type="text"
              value="${escapeHtml(info.teacher || '')}"
              class="w-full px-3.5 py-2 rounded-xl border border-amber-200"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Phòng học gắn bó</label>
            <input
              id="ci-room"
              type="text"
              value="${escapeHtml(info.Room || '')}"
              class="w-full px-3.5 py-2 rounded-xl border border-amber-200"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Châm ngôn / Lời tựa của lớp</label>
            <textarea
              id="ci-motto"
              rows="3"
              class="w-full px-3.5 py-2 rounded-xl border border-amber-200"
            >${escapeHtml(info.motto || '')}</textarea>
          </div>

          <div class="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onclick="closeClassInfoModal()"
              class="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
            >
              Hủy
            </button>
            <button
              type="submit"
              class="px-5 py-2 rounded-xl bg-indigo-950 text-amber-300 text-xs font-bold"
            >
              Lưu Thay Đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  refreshIcons();
};

window.closeClassInfoModal = () => {
  const root = document.getElementById('class-info-modal-root');
  root.classList.add('hidden');
  root.innerHTML = '';
};

window.submitClassInfoModal = async (event) => {
  event.preventDefault();
  const updated = {
    school: document.getElementById('ci-school')?.value || '',
    className: document.getElementById('ci-classname')?.value || '',
    title: document.getElementById('ci-title')?.value || '',
    teacher: document.getElementById('ci-teacher')?.value || '',
    Room: document.getElementById('ci-room')?.value || '',
    motto: document.getElementById('ci-motto')?.value || ''
  };
  state.classInfo = updated;
  if (state.user && db) {
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'class_settings', 'info'), updated);
    } catch (err) {
      console.error('Lỗi cập nhật thông tin lớp:', err);
    }
  }
  closeClassInfoModal();
  renderBannerAndFooter();
  showToast('Đã cập nhật thông tin lớp học!');
};

// --- Hộp thoại Xác nhận xóa (Không dùng alert/confirm trình duyệt) ---
let pendingConfirmAction = null;

function openConfirmDialog(title, message, onConfirm) {
  pendingConfirmAction = onConfirm;
  const root = document.getElementById('confirm-dialog-root');
  root.classList.remove('hidden');
  root.innerHTML = `
    <div class="fixed inset-0 z-[95] bg-indigo-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-200 space-y-4">
        <h4 class="text-lg font-black text-indigo-950">${escapeHtml(title)}</h4>
        <p class="text-sm text-slate-600 leading-relaxed">${escapeHtml(message)}</p>
        <div class="flex justify-end gap-3 pt-2">
          <button
            onclick="closeConfirmDialog()"
            class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
          >
            Hủy bỏ
          </button>
          <button
            onclick="executeConfirmAction()"
            class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
          >
            Xác nhận xóa
          </button>
        </div>
      </div>
    </div>
  `;
}

window.closeConfirmDialog = () => {
  pendingConfirmAction = null;
  const root = document.getElementById('confirm-dialog-root');
  root.classList.add('hidden');
  root.innerHTML = '';
};

window.executeConfirmAction = async () => {
  if (typeof pendingConfirmAction === 'function') {
    await pendingConfirmAction();
  }
  window.closeConfirmDialog();
};

window.confirmDeleteMember = (memberId) => {
  const member = state.members.find((m) => m.id === memberId);
  if (!member) return;
  openConfirmDialog(
    `Xóa hồ sơ của ${member.name}?`,
    `Bạn có chắc muốn xóa tiểu sử của ${member.name} khỏi sổ kỷ yếu không? Các bức ảnh kỷ niệm chung vẫn sẽ được giữ lại.`,
    async () => {
      state.members = state.members.filter((m) => m.id !== member.id);
      if (state.activeMemberId === member.id) {
        state.activeMemberId = null;
      }
      if (state.user && db) {
        try {
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'class_members', member.id));
        } catch (err) {
          console.error('Lỗi xóa thành viên:', err);
        }
      }
      renderAll();
      showToast(`Đã xóa hồ sơ của ${member.name}`);
    }
  );
};

window.confirmDeletePhoto = (photoId) => {
  const photo = state.photos.find((p) => p.id === photoId);
  if (!photo) return;
  openConfirmDialog(
    'Xóa bức ảnh kỷ niệm này?',
    `Bạn có chắc muốn xóa bức ảnh "${photo.caption}" khỏi kho kỷ niệm không?`,
    async () => {
      state.photos = state.photos.filter((p) => p.id !== photo.id);
      if (state.lightboxPhotoId === photo.id) {
        state.lightboxPhotoId = null;
      }
      if (state.user && db) {
        try {
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'class_photos', photo.id));
        } catch (err) {
          console.error('Lỗi xóa ảnh:', err);
        }
      }
      renderAll();
      showToast('Đã xóa bức ảnh kỷ niệm.');
    }
  );
};

// --- Khôi phục dữ liệu mẫu ---
window.handleRestoreSampleData = async () => {
  state.members = JSON.parse(JSON.stringify(INITIAL_MEMBERS));
  state.photos = JSON.parse(JSON.stringify(INITIAL_PHOTOS));
  renderAll();

  if (state.user && db) {
    try {
      for (const m of INITIAL_MEMBERS) {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'class_members', m.id), m);
      }
      for (const p of INITIAL_PHOTOS) {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'class_photos', p.id), p);
      }
    } catch (err) {
      console.error('Lỗi khôi phục dữ liệu mẫu:', err);
    }
  }
  showToast('Đã khôi phục bộ dữ liệu kỷ yếu mẫu đầy đủ!');
};

// ==========================================
// KHỞI CHẠY ỨNG DỤNG KHI TRANG TẢI XONG
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  renderAll();
  initFirebaseSync();
});
