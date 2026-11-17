/**
 * File Upload Workflow Test Script
 * 
 * Run this in the browser console to test the file upload integration
 * 
 * Usage:
 * 1. Open http://localhost:3000
 * 2. Open browser console (F12)
 * 3. Copy and paste this entire script
 * 4. Follow the test instructions
 */

console.log('🧪 File Upload Workflow Test Script');
console.log('=====================================\n');

// Test 1: Check IndexedDB
async function testIndexedDB() {
  console.log('Test 1: Checking IndexedDB...');
  
  try {
    const request = indexedDB.open('CAF_FILE_STORAGE', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      console.log('✅ IndexedDB database exists');
      console.log('   Database name:', db.name);
      console.log('   Version:', db.version);
      console.log('   Object stores:', Array.from(db.objectStoreNames));
      db.close();
    };
    
    request.onerror = () => {
      console.log('❌ IndexedDB database not found');
    };
  } catch (error) {
    console.log('❌ Error accessing IndexedDB:', error.message);
  }
}

// Test 2: Check localStorage for CAFs
function testLocalStorage() {
  console.log('\nTest 2: Checking localStorage for CAFs...');
  
  try {
    const cafsData = localStorage.getItem('cafs');
    if (cafsData) {
      const cafs = JSON.parse(cafsData);
      console.log('✅ Found', cafs.length, 'CAF records in localStorage');
      
      // Check for CAFs with file references
      const cafsWithFiles = cafs.filter(caf => 
        caf.documents && caf.documents.some(doc => doc.fileId)
      );
      
      if (cafsWithFiles.length > 0) {
        console.log('✅ Found', cafsWithFiles.length, 'CAFs with file references');
        console.log('   Sample CAF with files:', cafsWithFiles[0].id);
        console.log('   Documents:', cafsWithFiles[0].documents.map(d => ({
          name: d.name,
          fileId: d.fileId
        })));
      } else {
        console.log('⚠️  No CAFs with file references found');
        console.log('   This is normal if you haven\'t uploaded any files yet');
      }
    } else {
      console.log('⚠️  No CAF records found in localStorage');
    }
  } catch (error) {
    console.log('❌ Error reading localStorage:', error.message);
  }
}

// Test 3: List all uploaded files
async function testListFiles() {
  console.log('\nTest 3: Listing all uploaded files...');
  
  try {
    const request = indexedDB.open('CAF_FILE_STORAGE', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['uploaded_files'], 'readonly');
      const store = transaction.objectStore('uploaded_files');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        const files = getAllRequest.result;
        console.log('✅ Found', files.length, 'uploaded files');
        
        if (files.length > 0) {
          console.log('\n   File Details:');
          files.forEach((file, index) => {
            console.log(`   ${index + 1}. ${file.name}`);
            console.log(`      ID: ${file.id}`);
            console.log(`      Type: ${file.type}`);
            console.log(`      Size: ${(file.size / 1024).toFixed(2)} KB`);
            console.log(`      Category: ${file.category}`);
            console.log(`      CAF ID: ${file.cafId || 'Not assigned'}`);
            console.log(`      Upload Date: ${new Date(file.uploadDate).toLocaleString()}`);
          });
          
          // Calculate total storage
          const totalSize = files.reduce((sum, file) => sum + file.size, 0);
          console.log(`\n   Total Storage Used: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
        } else {
          console.log('⚠️  No files uploaded yet');
        }
        
        db.close();
      };
      
      getAllRequest.onerror = () => {
        console.log('❌ Error reading files from IndexedDB');
        db.close();
      };
    };
    
    request.onerror = () => {
      console.log('❌ Error opening IndexedDB');
    };
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

// Test 4: Verify file-CAF linkage
async function testFileCafLinkage() {
  console.log('\nTest 4: Verifying file-CAF linkage...');
  
  try {
    // Get CAFs from localStorage
    const cafsData = localStorage.getItem('cafs');
    if (!cafsData) {
      console.log('⚠️  No CAFs found');
      return;
    }
    
    const cafs = JSON.parse(cafsData);
    const cafsWithFileRefs = cafs.filter(caf => 
      caf.documents && caf.documents.some(doc => doc.fileId)
    );
    
    if (cafsWithFileRefs.length === 0) {
      console.log('⚠️  No CAFs with file references');
      return;
    }
    
    // Check if files exist in IndexedDB
    const request = indexedDB.open('CAF_FILE_STORAGE', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['uploaded_files'], 'readonly');
      const store = transaction.objectStore('uploaded_files');
      
      let checkedCount = 0;
      let foundCount = 0;
      let missingCount = 0;
      
      cafsWithFileRefs.forEach(caf => {
        caf.documents.forEach(doc => {
          if (doc.fileId) {
            checkedCount++;
            const getRequest = store.get(doc.fileId);
            
            getRequest.onsuccess = () => {
              if (getRequest.result) {
                foundCount++;
                console.log(`✅ File found: ${doc.name} (${doc.fileId})`);
              } else {
                missingCount++;
                console.log(`❌ File missing: ${doc.name} (${doc.fileId})`);
              }
              
              // Summary after all checks
              if (checkedCount === foundCount + missingCount) {
                console.log(`\n   Summary:`);
                console.log(`   Total file references: ${checkedCount}`);
                console.log(`   Files found: ${foundCount}`);
                console.log(`   Files missing: ${missingCount}`);
                
                if (missingCount === 0) {
                  console.log('   ✅ All file references are valid!');
                } else {
                  console.log('   ⚠️  Some files are missing from IndexedDB');
                }
              }
            };
          }
        });
      });
      
      if (checkedCount === 0) {
        console.log('⚠️  No file references to check');
      }
      
      db.close();
    };
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

// Test 5: Storage capacity check
async function testStorageCapacity() {
  console.log('\nTest 5: Checking storage capacity...');
  
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentUsed = ((usage / quota) * 100).toFixed(2);
      
      console.log('✅ Storage API available');
      console.log(`   Used: ${(usage / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Quota: ${(quota / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Percent Used: ${percentUsed}%`);
      
      if (percentUsed > 80) {
        console.log('   ⚠️  Storage is over 80% full!');
      } else if (percentUsed > 50) {
        console.log('   ⚠️  Storage is over 50% full');
      } else {
        console.log('   ✅ Plenty of storage available');
      }
    } catch (error) {
      console.log('❌ Error checking storage:', error.message);
    }
  } else {
    console.log('⚠️  Storage API not available in this browser');
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Running all tests...\n');
  
  await testIndexedDB();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  testLocalStorage();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  await testListFiles();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  await testFileCafLinkage();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  await testStorageCapacity();
  
  console.log('\n=====================================');
  console.log('✅ All tests completed!');
  console.log('\n📝 Manual Test Instructions:');
  console.log('1. Navigate to "New Application"');
  console.log('2. Fill in STEP 1 and STEP 2');
  console.log('3. In STEP 3, click on a document card');
  console.log('4. Select a file (JPG, PNG, or PDF < 10MB)');
  console.log('5. Verify file uploads successfully');
  console.log('6. Upload more files');
  console.log('7. Complete STEP 4 and submit');
  console.log('8. Run this script again to verify files are saved');
  console.log('\n💡 Tip: Use test-file-upload.html for isolated testing');
}

// Helper function to create a test file
function createTestFile() {
  console.log('\n🔧 Creating test file...');
  console.log('This will create a small test image file in memory');
  console.log('You can use this to test the upload functionality\n');
  
  // Create a small canvas with text
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  
  // Draw background
  ctx.fillStyle = '#1229B3';
  ctx.fillRect(0, 0, 400, 200);
  
  // Draw text
  ctx.fillStyle = 'white';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('AsiaInfo', 200, 80);
  ctx.font = '16px Arial';
  ctx.fillText('Test Document', 200, 120);
  ctx.fillText(new Date().toLocaleString(), 200, 150);
  
  // Convert to blob
  canvas.toBlob((blob) => {
    const file = new File([blob], 'test-document.png', { type: 'image/png' });
    console.log('✅ Test file created:');
    console.log('   Name:', file.name);
    console.log('   Type:', file.type);
    console.log('   Size:', (file.size / 1024).toFixed(2), 'KB');
    console.log('\n💡 To use this file:');
    console.log('   1. Go to CAF Form STEP 3');
    console.log('   2. Open browser console');
    console.log('   3. Run: createTestFile()');
    console.log('   4. The file will be available for testing');
  }, 'image/png');
}

// Export functions for manual use
window.testFileUpload = {
  runAll: runAllTests,
  testIndexedDB,
  testLocalStorage,
  testListFiles,
  testFileCafLinkage,
  testStorageCapacity,
  createTestFile
};

// Auto-run all tests
runAllTests();

console.log('\n💡 Available Commands:');
console.log('   testFileUpload.runAll() - Run all tests');
console.log('   testFileUpload.testIndexedDB() - Test IndexedDB');
console.log('   testFileUpload.testLocalStorage() - Test localStorage');
console.log('   testFileUpload.testListFiles() - List all files');
console.log('   testFileUpload.testFileCafLinkage() - Verify linkage');
console.log('   testFileUpload.testStorageCapacity() - Check storage');
console.log('   testFileUpload.createTestFile() - Create test file');
