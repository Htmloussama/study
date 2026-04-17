import { execSync } from 'child_process';
try {
    const info = execSync('pdftoppm -h').toString();
    console.log('pdftoppm found');
} catch (e) {
    console.error('pdftoppm not found');
}
