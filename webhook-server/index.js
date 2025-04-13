import express from 'express';
import { exec } from 'child_process';

const app = express();
const PORT = 4000;

app.use(express.json());

app.post('/webhook', (req, res) => {
  console.log('📦 웹훅 요청 도착!');
  exec('bash ~/deploy.sh', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ 에러: ${error.message}`);
      return res.status(500).send('실행 실패');
    }
    if (stderr) {
      console.error(`⚠️ stderr: ${stderr}`);
    }
    console.log(`✅ stdout: ${stdout}`);
    res.status(200).send('배포 완료');
  });
});

app.listen(PORT, () => {
  console.log(`🚀 웹훅 서버 실행 중! http://localhost:${PORT}`);
});
