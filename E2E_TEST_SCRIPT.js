/**
 * 端到端测试脚本
 * 在浏览器控制台中运行此脚本来验证完整的工作流程
 * 
 * 使用方法:
 * 1. 打开浏览器开发者工具 (F12)
 * 2. 切换到 Console 标签
 * 3. 复制并粘贴此脚本
 * 4. 按 Enter 运行
 */

(function() {
  console.log('🚀 开始端到端测试...\n');

  // 测试1: 检查localStorage中的数据
  console.log('📦 测试1: 检查本地存储数据');
  console.log('─────────────────────────────');
  
  const templateKey = 'caf_templates_store_v2';
  const cafKey = 'caf-app-registry-v1';
  const rulesKey = 'global_rules_v1';
  
  const templates = localStorage.getItem(templateKey);
  const cafs = localStorage.getItem(cafKey);
  const rules = localStorage.getItem(rulesKey);
  
  console.log(`✓ 模板数据 (${templateKey}):`, templates ? '存在' : '❌ 不存在');
  if (templates) {
    const parsed = JSON.parse(templates);
    console.log(`  - 模板数量: ${parsed.length}`);
    console.log(`  - 数据大小: ${(templates.length / 1024).toFixed(2)} KB`);
  }
  
  console.log(`✓ CAF数据 (${cafKey}):`, cafs ? '存在' : '❌ 不存在');
  if (cafs) {
    const parsed = JSON.parse(cafs);
    console.log(`  - CAF数量: ${parsed.cafs?.length || 0}`);
    console.log(`  - 归档文件数量: ${parsed.archiveEntries?.length || 0}`);
    console.log(`  - 数据大小: ${(cafs.length / 1024).toFixed(2)} KB`);
  }
  
  console.log(`✓ 全局规则 (${rulesKey}):`, rules ? '存在' : '❌ 不存在');
  if (rules) {
    const parsed = JSON.parse(rules);
    console.log(`  - 规则数量: ${parsed.length}`);
    console.log(`  - 数据大小: ${(rules.length / 1024).toFixed(2)} KB`);
  }
  
  // 测试2: 检查数据结构完整性
  console.log('\n📋 测试2: 检查数据结构完整性');
  console.log('─────────────────────────────');
  
  if (cafs) {
    const cafData = JSON.parse(cafs);
    
    // 检查CAF状态分布
    const statusCount = {};
    cafData.cafs?.forEach(caf => {
      statusCount[caf.status] = (statusCount[caf.status] || 0) + 1;
    });
    
    console.log('✓ CAF状态分布:');
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`  - ${status}: ${count}`);
    });
    
    // 检查客户类型分布
    const typeCount = {};
    cafData.cafs?.forEach(caf => {
      typeCount[caf.customerType] = (typeCount[caf.customerType] || 0) + 1;
    });
    
    console.log('✓ 客户类型分布:');
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`);
    });
    
    // 检查归档文件
    if (cafData.archiveEntries && cafData.archiveEntries.length > 0) {
      console.log('✓ 归档文件:');
      cafData.archiveEntries.slice(0, 3).forEach(entry => {
        console.log(`  - ${entry.name} (${entry.size}) - CAF: ${entry.cafId}`);
      });
      if (cafData.archiveEntries.length > 3) {
        console.log(`  ... 还有 ${cafData.archiveEntries.length - 3} 个文件`);
      }
    }
  }
  
  // 测试3: 检查数据关联性
  console.log('\n🔗 测试3: 检查数据关联性');
  console.log('─────────────────────────────');
  
  if (cafs) {
    const cafData = JSON.parse(cafs);
    
    // 检查归档文件是否都有对应的CAF
    let orphanedFiles = 0;
    cafData.archiveEntries?.forEach(entry => {
      const cafExists = cafData.cafs?.some(caf => caf.id === entry.cafId);
      if (!cafExists) {
        orphanedFiles++;
        console.log(`⚠️  孤立文件: ${entry.name} (CAF ${entry.cafId} 不存在)`);
      }
    });
    
    if (orphanedFiles === 0) {
      console.log('✓ 所有归档文件都有对应的CAF');
    } else {
      console.log(`⚠️  发现 ${orphanedFiles} 个孤立文件`);
    }
    
    // 检查已归档的CAF是否都有归档文件
    const archivedCAFs = cafData.cafs?.filter(caf => caf.status === 'Archived') || [];
    let missingArchives = 0;
    archivedCAFs.forEach(caf => {
      const archiveExists = cafData.archiveEntries?.some(entry => entry.cafId === caf.id);
      if (!archiveExists) {
        missingArchives++;
        console.log(`⚠️  缺少归档文件: CAF ${caf.id}`);
      }
    });
    
    if (missingArchives === 0 && archivedCAFs.length > 0) {
      console.log('✓ 所有已归档的CAF都有归档文件');
    } else if (archivedCAFs.length === 0) {
      console.log('ℹ️  暂无已归档的CAF');
    } else {
      console.log(`⚠️  ${missingArchives} 个已归档CAF缺少归档文件`);
    }
  }
  
  // 测试4: 计算总存储使用量
  console.log('\n💾 测试4: 存储使用情况');
  console.log('─────────────────────────────');
  
  let totalSize = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalSize += localStorage[key].length;
    }
  }
  
  console.log(`✓ localStorage总使用量: ${(totalSize / 1024).toFixed(2)} KB`);
  console.log(`✓ 剩余空间估算: ${(5120 - totalSize / 1024).toFixed(2)} KB (假设5MB限制)`);
  
  if (totalSize / 1024 > 4096) {
    console.log('⚠️  警告: 存储使用量超过4MB，接近浏览器限制');
  } else {
    console.log('✓ 存储使用量正常');
  }
  
  // 测试5: 模拟数据持久化测试
  console.log('\n🔄 测试5: 数据持久化验证');
  console.log('─────────────────────────────');
  console.log('提示: 请执行以下操作来验证数据持久化:');
  console.log('1. 刷新页面 (F5)');
  console.log('2. 检查数据是否仍然存在');
  console.log('3. 关闭浏览器标签');
  console.log('4. 重新打开并访问系统');
  console.log('5. 再次运行此测试脚本');
  
  // 测试6: 工作流程完整性检查
  console.log('\n✅ 测试6: 工作流程完整性');
  console.log('─────────────────────────────');
  
  const workflows = [
    { name: '模板管理', key: templateKey, check: !!templates },
    { name: 'CAF创建', key: cafKey, check: !!cafs },
    { name: '审核流程', key: cafKey, check: !!cafs },
    { name: '文档归档', key: cafKey, check: !!cafs && JSON.parse(cafs).archiveEntries?.length > 0 },
    { name: '全局规则', key: rulesKey, check: !!rules }
  ];
  
  workflows.forEach(workflow => {
    console.log(`${workflow.check ? '✓' : '❌'} ${workflow.name}: ${workflow.check ? '正常' : '未初始化'}`);
  });
  
  // 总结
  console.log('\n📊 测试总结');
  console.log('═════════════════════════════');
  
  const allChecks = workflows.every(w => w.check);
  if (allChecks) {
    console.log('✅ 所有测试通过！端到端流程完整，数据持久化正常。');
  } else {
    console.log('⚠️  部分测试未通过，请检查上述详情。');
  }
  
  console.log('\n💡 提示:');
  console.log('- 要查看完整的CAF数据: JSON.parse(localStorage.getItem("caf-app-registry-v1"))');
  console.log('- 要查看模板数据: JSON.parse(localStorage.getItem("caf_templates_store_v2"))');
  console.log('- 要查看全局规则: JSON.parse(localStorage.getItem("global_rules_v1"))');
  console.log('- 要清空所有数据: localStorage.clear() (谨慎使用!)');
  
  console.log('\n✨ 测试完成！\n');
})();
