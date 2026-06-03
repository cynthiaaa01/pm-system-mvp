const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  console.log("登入測試帳號...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: process.env.TEST_EMAIL,
    password: process.env.TEST_PASSWORD
  });

  if (authError || !authData.user) {
    console.error("登入失敗，請確認帳號是否建立且驗證通過", authError);
    return;
  }
  const userId = authData.user.id;
  console.log(`成功登入 User ID: ${userId}`);

  // 1. 建立客戶
  console.log("1. 建立測試客戶...");
  let { data: client } = await supabase.from('clients').select('id').eq('name', 'Bonio Inc.').single();
  if (!client) {
    const res = await supabase.from('clients').insert({ name: 'Bonio Inc.' }).select().single();
    client = res.data;
  }
  
  // 2. 建立提案
  console.log("2. 建立測試提案...");
  const { data: proposal, error: propErr } = await supabase.from('proposals').insert({
    title: '2026 Q3 品牌行銷活動',
    client_id: client.id,
    amount: 1500000,
    sales_person_id: userId,
    status: 'won',
    expected_start: new Date().toISOString(),
    parsed_items: {
      items: [
        { name: 'KOL 合作宣傳' },
        { name: '社群圖文懶人包' }
      ]
    }
  }).select().single();
  
  if (propErr) {
    console.error("提案建立失敗", propErr);
    return;
  }
  console.log(`提案建立成功: ${proposal.title}`);

  // 3. 建立專案
  console.log("3. 提案已成交，轉換為專案...");
  const { data: project, error: projErr } = await supabase.from('projects').insert({
    name: proposal.title,
    client_id: client.id,
    proposal_id: proposal.id,
    operations_id: userId,
    marketing_id: userId,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'in_progress'
  }).select().single();

  if (projErr) {
    console.error("專案建立失敗", projErr);
    return;
  }
  console.log(`專案建立成功: ${project.name}`);

  // 4. 建立任務
  console.log("4. 建立專案任務...");
  const { data: tasks, error: taskErr } = await supabase.from('tasks').insert([
    {
      project_id: project.id,
      title: '確定 KOL 人選與合約',
      status: 'done',
      priority: 'high',
      assignee_id: userId,
      start_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    {
      project_id: project.id,
      title: '腳本與大綱撰寫',
      status: 'in_progress',
      priority: 'medium',
      assignee_id: userId,
      start_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    {
      project_id: project.id,
      title: '懶人包設計初稿',
      status: 'todo',
      priority: 'medium',
      assignee_id: userId,
      start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      due_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  ]).select();

  if (taskErr) {
    console.error("任務建立失敗", taskErr);
    return;
  }
  
  // 5. 建立任務動態
  console.log("5. 建立任務動態與通知 (動態牆測試)...");
  
  const { error: updateErr } = await supabase.from('task_updates').insert({
    task_id: tasks[0].id,
    project_id: project.id,
    author_id: userId,
    content: '已經與 3 位 KOL 確認檔期，目前合約已經發送給法務審核中，預計明天會寄給 KOL 簽署。',
    update_type: 'comment'
  });
  
  if (updateErr) {
    console.log("⚠️ 無法建立任務動態 (可能尚未建立 task_updates 資料表):", updateErr.message);
  } else {
    console.log("✅ 任務動態新增成功！");
  }

  console.log("\n🎉 業務流程測試資料準備完畢！請打開瀏覽器重整頁面查看成果！");
}

run();
