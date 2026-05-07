/**
 * CAF 管理系统完整流程测试脚本
 * 
 * 在浏览器控制台中运行此脚本来验证整个流程
 */

// 1. 清除现有数据（可选）
function clearData() {
  localStorage.removeItem('caf-app-registry-v1');
  console.log('✅ 已清除本地数据');
  console.log('🔄 请刷新页面以重新加载');
}

// 2. 查看当前数据
function viewData() {
  const data = JSON.parse(localStorage.getItem('caf-app-registry-v1') || '{}');
  console.log('📊 当前数据状态:');
  console.log('- CAF 单数量:', data.cafs?.length || 0);
  console.log('- 归档文件数量:', data.archiveEntries?.length || 0);
  console.log('\n详细数据:', data);
  return data;
}

// 3. 查看待审核的 CAF
function viewPendingCAFs() {
  const data = JSON.parse(localStorage.getItem('caf-app-registry-v1') || '{}');
  const pending = (data.cafs || []).filter(c => c.status === 'Pending');
  console.log('⏳ 待审核 CAF 列表:');
  pending.forEach(caf => {
    console.log(`- ${caf.id}: ${caf.fullName} (${caf.serviceType})`);
  });
  return pending;
}

// 4. 查看已归档的 CAF
function viewArchivedCAFs() {
  const data = JSON.parse(localStorage.getItem('caf-app-registry-v1') || '{}');
  const archived = (data.cafs || []).filter(c => c.status === 'Archived');
  console.log('📦 已归档 CAF 列表:');
  archived.forEach(caf => {
    console.log(`- ${caf.id}: ${caf.fullName} (${caf.serviceType})`);
  });
  return archived;
}

// 5. 查看归档文件
function viewArchiveFiles() {
  const data = JSON.parse(localStorage.getItem('caf-app-registry-v1') || '{}');
  const files = data.archiveEntries || [];
  console.log('📄 归档文件列表:');
  files.forEach(file => {
    console.log(`- ${file.name} (${file.size}) - ${file.status}`);
    console.log(`  关联 CAF: ${file.cafId}`);
    console.log(`  归档时间: ${new Date(file.archivedAt).toLocaleString()}`);
  });
  return files;
}

// 6. 完整流程测试
function testFullWorkflow() {
  console.log('🚀 开始完整流程测试\n');
  
  console.log('步骤 1: 查看初始状态');
  const initial = viewData();
  console.log('\n');
  
  console.log('步骤 2: 查看待审核 CAF');
  const pending = viewPendingCAFs();
  console.log('\n');
  
  console.log('步骤 3: 查看已归档 CAF');
  const archived = viewArchivedCAFs();
  console.log('\n');
  
  console.log('步骤 4: 查看归档文件');
  const files = viewArchiveFiles();
  console.log('\n');
  
  console.log('📊 测试总结:');
  console.log(`- 总 CAF 数: ${initial.cafs?.length || 0}`);
  console.log(`- 待审核: ${pending.length}`);
  console.log(`- 已归档: ${archived.length}`);
  console.log(`- 归档文件: ${files.length}`);
  
  if (archived.length === files.length) {
    console.log('✅ 归档流程正常：已归档 CAF 数量与归档文件数量一致');
  } else {
    console.log('⚠️  警告：已归档 CAF 数量与归档文件数量不一致');
  }
}

// 7. 验证特定 CAF 的归档状态
function verifyCafArchive(cafId) {
  const data = JSON.parse(localStorage.getItem('caf-app-registry-v1') || '{}');
  const caf = (data.cafs || []).find(c => c.id === cafId);
  const file = (data.archiveEntries || []).find(f => f.cafId === cafId);
  
  console.log(`🔍 验证 CAF: ${cafId}`);
  
  if (!caf) {
    console.log('❌ CAF 不存在');
    return;
  }
  
  console.log(`- CAF 状态: ${caf.status}`);
  console.log(`- 客户名称: ${caf.fullName}`);
  console.log(`- 服务类型: ${caf.serviceType}`);
  
  if (caf.status === 'Archived') {
    if (file) {
      console.log(`✅ 已找到归档文件: ${file.name}`);
      console.log(`- 文件大小: ${file.size}`);
      console.log(`- 归档时间: ${new Date(file.archivedAt).toLocaleString()}`);
    } else {
      console.log('⚠️  警告：CAF 已归档但未找到归档文件');
    }
  } else {
    console.log(`ℹ️  CAF 状态为 ${caf.status}，尚未归档`);
  }
}

// 导出函数到全局
window.CAFTest = {
  clearData,
  viewData,
  viewPendingCAFs,
  viewArchivedCAFs,
  viewArchiveFiles,
  testFullWorkflow,
  verifyCafArchive
};

console.log('✅ CAF 测试工具已加载');
console.log('📖 使用方法:');
console.log('  CAFTest.testFullWorkflow()     - 运行完整流程测试');
console.log('  CAFTest.viewData()             - 查看所有数据');
console.log('  CAFTest.viewPendingCAFs()      - 查看待审核 CAF');
console.log('  CAFTest.viewArchivedCAFs()     - 查看已归档 CAF');
console.log('  CAFTest.viewArchiveFiles()     - 查看归档文件');
console.log('  CAFTest.verifyCafArchive(id)   - 验证特定 CAF 的归档状态');
console.log('  CAFTest.clearData()            - 清除所有数据');
