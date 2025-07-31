import { createLeftColumnHTML } from './leftColumn.js';
import { createRightColumnHTML } from './rightColumn.js';

// 메인 그리드 레이아웃 템플릿
export function createMainGridHTML() {
  return `
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden">
      <!-- 왼쪽 컬럼 -->
      ${createLeftColumnHTML()}
      
      <!-- 오른쪽 컬럼 -->
        <div class="bg-black text-white p-8 flex flex-col">
        ${createRightColumnHTML()}
      </div>
    </div>
  `;
}
