import http from 'http';
import { exec } from 'child_process';

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    console.log('📨 Webhook POST 요청 수신됨');

    // 절대 경로 + 정확한 앱 이름 사용
    const command = 'cd /home/ubuntu/GlobalEduSupport && git pull origin main && pm2 restart backend'; // <-- 'backend'는 실제 앱 이름에 맞게!

    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error('❌ Deploy error!');
        console.error('err:', err);
        console.error('stderr:', stderr);
        res.writeHead(500);
        res.end('Deploy failed');
        return;
      }

      console.log('✅ Deploy success!');
      console.log('stdout:', stdout);
      res.writeHead(200);
      res.end('Deploy successful');
    });
  } else {
    res.writeHead(405);
    res.end('Only POST allowed');
  }
});

server.listen(4000, () => {
  console.log('🚀 Webhook server listening on port 4000');
});

