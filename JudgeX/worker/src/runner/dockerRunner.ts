import Docker from 'dockerode';
import * as tar from 'tar-stream';

const docker = new Docker();

export const runCode = async (language: string, code: string, input: string, isPlayground: boolean = false) => {
  let image = '';
  let cmd: string[] = [];
  let fileName = '';

  switch (language) {
      case 'python':
      image = 'python:3.9-alpine';
      fileName = 'main.py';
      cmd = ['sh', '-c', `python /main.py < /input.txt`];
      break;
    case 'c':
      image = 'frolvlad/alpine-gxx';
      fileName = 'main.c';
      cmd = ['sh', '-c', `gcc /main.c -o /main && /main < /input.txt`];
      break;
    case 'cpp':
      image = 'frolvlad/alpine-gxx'; // Lightweight image with g++
      fileName = 'main.cpp';
      cmd = ['sh', '-c', `g++ /main.cpp -o /main && /main < /input.txt`];
      break;
    case 'go':
      image = 'golang:1.20-alpine';
      fileName = 'main.go';
      cmd = ['sh', '-c', `go run /main.go < /input.txt`];
      break;
    case 'rust':
      image = 'rust:1.70-alpine';
      fileName = 'main.rs';
      cmd = ['sh', '-c', `rustc /main.rs -o /main && /main < /input.txt`];
      break;
    case 'java':
      image = 'openjdk:11-jdk-slim';
      fileName = 'Main.java';
      cmd = ['sh', '-c', `javac /Main.java && java -cp / Main < /input.txt`];
      break;
    case 'javascript':
    case 'typescript': 
      image = 'node:18-alpine';
      fileName = 'main.js';
      cmd = ['sh', '-c', `node /main.js < /input.txt`];
      break;
    default:
      return { error: `Unsupported language: ${language}`, output: '' };
  }

  try {
    // Ensure image exists
    await new Promise((resolve, reject) => {
      docker.pull(image, (err: any, stream: any) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, onFinished);
        function onFinished(err: any, output: any) {
          if (err) return reject(err);
          resolve(output);
        }
      });
    });

    const container = await docker.createContainer({
      Image: image,
      Cmd: cmd,
      Tty: false,
      HostConfig: {
        AutoRemove: true,
        Memory: 256 * 1024 * 1024, // 256MB limit
        NetworkMode: 'none', // completely isolated from network
      }
    });

    // Create a tar archive with the code and input
    const pack = tar.pack();
    pack.entry({ name: fileName }, code);
    pack.entry({ name: 'input.txt' }, input);
    pack.finalize();

    // Extract archive to / in the container
    await container.putArchive(pack, { path: '/' });

    // Start execution
    await container.start();

    // Wait for container to finish or timeout (5 seconds)
    const timeout = new Promise((resolve) => setTimeout(() => resolve({ Error: 'Timeout' }), 5000));
    const wait = container.wait();
    const result: any = await Promise.race([wait, timeout]);

    if (result.Error === 'Timeout') {
      try { await container.kill(); } catch (e) {}
      return { error: 'Time limit exceeded', output: '', isTimeLimit: true };
    }

    // Get logs
    const logs = await container.logs({ stdout: true, stderr: true });
    
    // dockerode returns a multiplexed stream when Tty is false
    // we need to strip the 8-byte header from each payload block
    let output = '';
    let errorOutput = '';
    let i = 0;
    while (i < logs.length) {
      const type = logs[i];
      const length = logs.readUInt32BE(i + 4);
      const payload = logs.toString('utf8', i + 8, i + 8 + length);
      if (type === 1) output += payload;
      else if (type === 2) errorOutput += payload;
      i += 8 + length;
    }

    if (result.StatusCode !== 0 || errorOutput) {
      return { error: errorOutput || 'Runtime Error', output };
    }

    return { output, error: null };
  } catch (err: any) {
    return { error: err.message || 'Sandbox error', output: '' };
  }
};
