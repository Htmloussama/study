import { execSync } from 'child_process';
try {
    const pythonVersion = execSync('python3 --version').toString();
    console.log('Python version:', pythonVersion);
    const pipVersion = execSync('pip3 --version').toString();
    console.log('Pip version:', pipVersion);
} catch (e) {
    console.error('Python not found via Node exec');
}
