
    let steps = [];         
    let currentStep = 0;    
    let stack = [];        
    let treeRoot = null;    
    let nodeMap = {};       

    
    function logStep(type, value, id, parentId = null) {
      steps.push({ type, value, id, parentId });
    }

    let nodeId = 0;
    function generateSteps(n, parentId = null) {
      const currId = nodeId++;
      logStep('call', `fib(${n})`, currId, parentId);

      let node = {
        id: currId,
        n: n,
        type: 'call',
        children: [],
        parentId: parentId,
        result: null
      };

      nodeMap[currId] = node;

      if (n <= 1) {
        logStep('return', `fib(${n}) = ${n}`, currId, parentId);
        node.type = 'return';
        node.result = n;
        return node;
      }

      
      let left = generateSteps(n - 1, currId);
      let right = generateSteps(n - 2, currId);
      node.children.push(left, right);

      let result = left.result + right.result;
      logStep('return', `fib(${n}) = ${result}`, currId, parentId);
      node.type = 'return';
      node.result = result;
      return node;
    }

    function renderStack(stackList) {
      const stackDiv = document.getElementById('stack');
      stackDiv.innerHTML = '';
      stackList.forEach((s, i) => {
        const div = document.createElement('div');
        div.className = 'stack-item' + (i === stackList.length - 1 ? ' top' : '');
        div.textContent = s;
        stackDiv.appendChild(div);
      });
    }

    function renderTree(node, highlightId = null) {
      if (!node) return '';
      let nodeDiv = document.createElement('div');
      nodeDiv.className = 'node';
      nodeDiv.classList.add(node.type === 'call' ? 'call' : 'return');
      if (node.id === highlightId) nodeDiv.classList.add('current');
      nodeDiv.textContent = `fib(${node.n})` + (node.type === 'return' ? ` = ${node.result}` : '');
      nodeDiv.id = 'node-' + node.id; // Assign unique DOM id

    
      if (node.children && node.children.length) {
        let childrenDiv = document.createElement('div');
        childrenDiv.className = 'children';
        node.children.forEach(child => {
          childrenDiv.appendChild(renderTree(child, highlightId));
        });
        nodeDiv.appendChild(childrenDiv);
      }
      return nodeDiv;
    }

    
    function drawArrows(node) {
      const svg = document.getElementById('arrows');
      svg.innerHTML = `
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" style="fill:#666;" />
          </marker>
        </defs>
      `;

      function connect(parent, child) {
        const parentDiv = document.getElementById('node-' + parent.id);
        const childDiv = document.getElementById('node-' + child.id);
        if (!parentDiv || !childDiv) return;

        const parentRect = parentDiv.getBoundingClientRect();
        const childRect = childDiv.getBoundingClientRect();
        const containerRect = svg.parentNode.getBoundingClientRect();

        
        const startX = parentRect.left + parentRect.width / 2 - containerRect.left;
        const startY = parentRect.bottom - containerRect.top;
        const endX = childRect.left + childRect.width / 2 - containerRect.left;
        const endY = childRect.top - containerRect.top;

        
        const line = document.createElementNS('https://www.w3.org/TR/SVG/', 'line');
        line.setAttribute('x1', startX);
        line.setAttribute('y1', startY);
        line.setAttribute('x2', endX);
        line.setAttribute('y2', endY);
        line.setAttribute('class', 'arrow-line');
        line.setAttribute('marker-end', 'url(#arrowhead)');
        svg.appendChild(line);
      }

      function traverse(node) {
        if (!node.children) return;
        node.children.forEach(child => {
          connect(node, child);
          traverse(child);
        });
      }
      traverse(node);
    }

    
    function nextStep() {
      if (currentStep >= steps.length) return;
      const step = steps[currentStep];
      if (step.type === 'call') {
        stack.push(step.value);
      } else if (step.type === 'return') {
        stack.pop();
      }
      renderStack(stack);
      renderTreeHighlight();
      currentStep++;
      updateButtons();
    }

    function prevStep() {
      if (currentStep <= 0) return;
      currentStep--;
      const step = steps[currentStep];
      if (step.type === 'call') {
        stack.pop();
      } else if (step.type === 'return') {
        stack.push(step.value.replace(/ =.*$/, ''));
      }
      renderStack(stack);
      renderTreeHighlight();
      updateButtons();
    }

    
    function renderTreeHighlight() {
      let highlightId = null;
      if (currentStep < steps.length) {
        highlightId = steps[currentStep].id;
      }
      const treeDiv = document.getElementById('tree');
      treeDiv.innerHTML = '';
      treeDiv.appendChild(renderTree(treeRoot, highlightId));
      // Draw arrows after DOM is ready
      setTimeout(() => drawArrows(treeRoot), 0);
    }


    function startStepByStep() {
      let n = parseInt(document.getElementById('inputN').value);
      if (isNaN(n) || n < 1 || n > 8) {
        alert('Please enter an integer n between 1 and 8.');
        return;
      }

      steps = [];
      stack = [];
      nodeId = 0;
      nodeMap = {};
      currentStep = 0;
      document.getElementById('tree').innerHTML = '';
      document.getElementById('stack').innerHTML = '';
      document.getElementById('arrows').innerHTML = '';
      // Generate steps and tree
      treeRoot = generateSteps(n);
      renderStack(stack);
      renderTreeHighlight();
      updateButtons();
    }

    function resetAll() {
      steps = [];
      stack = [];
      nodeId = 0;
      nodeMap = {};
      currentStep = 0;
      treeRoot = null;
      document.getElementById('tree').innerHTML = '';
      document.getElementById('stack').innerHTML = '';
      document.getElementById('arrows').innerHTML = '';
      updateButtons();
    }

    function updateButtons() {
      document.getElementById('nextBtn').disabled = (steps.length === 0 || currentStep >= steps.length);
      document.getElementById('prevBtn').disabled = (steps.length === 0 || currentStep <= 0);
      document.getElementById('resetBtn').disabled = (steps.length === 0 && stack.length === 0);
    }

    document.getElementById('inputN').addEventListener('input', function() {
      let n = parseInt(this.value);
      if (isNaN(n) || n < 1) this.value = 1;
      if (n > 8) this.value = 8;
    });
    document.addEventListener('keydown', function(e) {
      if (!steps.length) return;
      if (e.key === 'ArrowRight') nextStep();
      if (e.key === 'ArrowLeft') prevStep();
      if (e.key === 'r' || e.key === 'R') resetAll();
    });
