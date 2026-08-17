"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCode = void 0;
const dockerode_1 = __importDefault(require("dockerode"));
const tar = __importStar(require("tar-stream"));
const docker = new dockerode_1.default();
const runCode = async (language, code, input) => {
    let image = '';
    let cmd = [];
    let fileName = '';
    switch (language) {
        case 'python':
            image = 'python:3.9-alpine';
            fileName = 'main.py';
            cmd = ['sh', '-c', `python /app/main.py < /app/input.txt`];
            break;
        case 'javascript':
        case 'typescript':
            image = 'node:18-alpine';
            fileName = 'main.js';
            cmd = ['sh', '-c', `node /app/main.js < /app/input.txt`];
            break;
        default:
            return { error: `Unsupported language: ${language}`, output: '' };
    }
    try {
        // Ensure image exists
        await new Promise((resolve, reject) => {
            docker.pull(image, (err, stream) => {
                if (err)
                    return reject(err);
                docker.modem.followProgress(stream, onFinished);
                function onFinished(err, output) {
                    if (err)
                        return reject(err);
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
        // Extract archive to /app in the container
        await container.putArchive(pack, { path: '/app' });
        // Start execution
        await container.start();
        // Wait for container to finish or timeout (5 seconds)
        const timeout = new Promise((resolve) => setTimeout(() => resolve({ Error: 'Timeout' }), 5000));
        const wait = container.wait();
        const result = await Promise.race([wait, timeout]);
        if (result.Error === 'Timeout') {
            try {
                await container.kill();
            }
            catch (e) { }
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
            if (type === 1)
                output += payload;
            else if (type === 2)
                errorOutput += payload;
            i += 8 + length;
        }
        if (result.StatusCode !== 0 || errorOutput) {
            return { error: errorOutput || 'Runtime Error', output };
        }
        return { output, error: null };
    }
    catch (err) {
        return { error: err.message || 'Sandbox error', output: '' };
    }
};
exports.runCode = runCode;
