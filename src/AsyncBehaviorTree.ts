var xml2js = require('xml2js');
const merge = require('deepmerge');


class AsyncBehaviorTree {

  p: any;

  exe: any = [];

  printParse: boolean = false;
  printCall: boolean = false;
  printWarnings: boolean = true;
  warnUndefinedReturn: boolean = true;
  printWrites: boolean = false;

  debugDoStrip: boolean = false;

  destroyed: boolean = false;

  nestingTypes: any = {
    'sequence':true,
    'fallback':true,
    'inverter':true,
    'forcesuccess':true,
  };


  constructor(xml: string, public bb: any) {
    const opts = {
      explicitChildren: true,
      preserveChildrenOrder: true,
    };

    let parser = new xml2js.Parser(opts);

    parser.parseString(xml, this.parseResults.bind(this));
  }

  destroy() {
    this.destroyed = true;
    this.p = null;
    this.exe = null;
  }

  // istanbul ignore next
  warning(t: string) {
    if(this.printWarnings) {
      const prefix = 'ABT Warning: ';
      console.log(prefix + t);
    }
  }

  evaluateCondition(n: string): boolean {
    // istanbul ignore if
    if( this.printCall ) {
      console.log(`checking condition ${n}`);
    }

    let result = this.bb[n];

    if( result ) {
      return true;
    } else {
      return false;
    }
  }

  scanForVariable(trimmed: string): boolean {
    if(trimmed.charAt(0) === '$' && trimmed.charAt(1) === '{' && trimmed.charAt(trimmed.length-1) === '}') {
      return true;
    } else {
      return false;
    }
  }

  // looks for {} values in nodes
  // these values are loaded from the board
  // if no {} are found the original rawValue is returned
  // spaces are trimmed from the value before checking for {} in case of a mistaked space in the GUI
  // however this trim() has no effect if {} are not found
  detectAndLoadBraceValues(rawValue: string): string | any {
    const rawTrimmed = rawValue.trim();
    if(this.scanForVariable(rawTrimmed)) {

    } else {
      return rawValue;
    }

    const lookup = rawTrimmed.slice(2,rawTrimmed.length-1);

    // istanbul ignore if
    if( this.printCall ) {
      console.log(`looking up: '${lookup}'`);
    }

    const ls = lookup.split('.');

    // console.log(ls);

    let unpack = this.bb;

    for(let i = 0; i < ls.length; i++) {
      let layer = ls[i];
      if(unpack[layer] == undefined) {
        return undefined;
      }

      unpack = unpack[layer]
    }

    return unpack;
  }

  // returns true if successful
  detectAndStoreBraceValues(rawValue: string, value: any): boolean {
    const rawTrimmed = rawValue.trim();
    if(this.scanForVariable(rawTrimmed)) {

    } else {
      return false;
    }

    const lookup = rawTrimmed.slice(2,rawTrimmed.length-1);

    // istanbul ignore if
    if( this.printCall ) {
      console.log(`store looking up: '${lookup}'`);
    }

    const ls = lookup.split('.');

    let unpack = this.bb;
    
    let layer = ls[0];
    let i = 0;
    for(i = 0; i < ls.length-1; i++) {
      layer = ls[i];
      if(unpack[layer] == undefined) {
        unpack[layer] = {};
      }

      unpack = unpack[layer]
    }

    if( unpack == undefined ) {
      this.warning("Loop in detectAndStoreBraceValues() failed to set undefined");
      return false;
    }

    unpack[ls[i]] = value;

    return true;
  }

  buildInObject(node: any, found: any) {
    let objIn = {};

    const letin = {
      "in":true,
      "inout":true,
    }

    for(let i = 0; i < found.ports.length; i++) {
      const port = found.ports[i];
      if( port.dir in letin ) {

        let rawValue;
        // does the node have a value for this argument
        if( port.name in node.args && (node.args[port.name] !== '') ) {
          rawValue = node.args[port.name];
        } else {
          // use the default
          rawValue = port.default != undefined?port.default:'';
        }

        const loaded = this.detectAndLoadBraceValues(rawValue);

        objIn[port.name] = loaded;
      }
    }

    return objIn;
  }

  buildInArgs(node: any, found: any) {
    let arrIn: any[] = [];

    const letin = {
      "in":true,
      "inout":true,
    }

    let idx = 0;
    let foundNext = true;
    while(foundNext) {
      foundNext = false;
      let key = `_in_${idx}`;
      for(let i = 0; i < found.ports.length; i++) {
        const port = found.ports[i];
        if( (port.dir in letin) && port.name === key  ) {

           let rawValue;
           if( (node.args[port.name] !== '') ) {
             rawValue = node.args[port.name];
           } else {
             // use the default
             rawValue = port.default != undefined?port.default:'';
           }
           const loaded = this.detectAndLoadBraceValues(rawValue);

           arrIn.push(loaded);
           foundNext = true;
           idx++;
           break;
        }
      }
    }
    return arrIn;
  }

  // only call this when the node has returned success
  handleOutObject(node: any, found: any, result: any) {
    const letout = {
      "out":true,
      "inout":true,
    };

    // debugger;

    for(let i = 0; i < found.ports.length; i++) {
      const port = found.ports[i];
      if( port.dir in letout ) {

        let rawValue;
        // does the node have a value for this argument
        if( port.name in result ) {
          rawValue = node.args[port.name];
        } else {
          continue; // function did not provide an output for this port
        }

        const gotBack = result[port.name];

        // istanbul ignore if
        if( gotBack == undefined ) {
          this.warning(`${rawValue} was not found in result object`);
          continue;
        }

        this.detectAndStoreBraceValues(rawValue, gotBack);

        if( this.printCall ) {
          console.log(`set ${port.name} to ${rawValue} , ${gotBack}`);
        }

      }
    }
  }

  handleOutArgs(node: any, found: any, result: any) {
    const letout = {
      "out":true,
      "inout":true,
    };

    const key = '_out_0';

    let worked: boolean = false;
    let worked2: boolean = false;


    for(let i = 0; i < found.ports.length; i++) {
      const port = found.ports[i];
      if( (port.dir in letout) && port.name === key ) {

        let rawValue = node.args[port.name];

        const gotBack = result;

        // istanbul ignore if
        if( this.printWrites ) {
          console.log(`writing ${gotBack} to ${rawValue}`);
        }

        worked2 = this.detectAndStoreBraceValues(rawValue, gotBack);
        worked = true;
        
      }
    }

    if( !worked ) {
      console.log('handleOutArgs() worked was false');
    }

    if( !worked2 ) {
      console.log('handleOutArgs() worked2 was false');
    }


  }

  async callAction(node: any): Promise<boolean> {

    const n: string = node.name;

    // istanbul ignore if
    if( this.printCall ) {
      console.log(`calling ${n}`);
    }

    let found = this.functionDescriptions[n];

    let result;
    let useInArgsMode = false;
    let useOutArgsMode = false;

    if( !found ) {
      this.warning(`${n} was not found in functionDescriptions`);
      result = await this.bb[n]();
    } else {


      for(let i = 0; i < found.ports.length; i++) {
        const port = found.ports[i];
        if( port.name == '_in_0' ) {
          useInArgsMode = true;
        }
        if( port.name == '_out_0' ) {
          useOutArgsMode = true;
        }
      }

      if( useInArgsMode ) {
        const arrIn = this.buildInArgs(node, found);
        
        result = await this.bb[n](...arrIn);

      } else {
        const objIn = this.buildInObject(node, found);

        result = await this.bb[n](objIn);
      }

    }




    if( this.warnUndefinedReturn && result == undefined ) {
      this.warning(`${n} returned 'undefined' and thus will fail`)
    }

    // if result was an object
    // pull the ret key
    // this allows us to deal with out / inout
    let ret;
    if( typeof result !== 'object' ) {
      ret = result;
    } else {
      ret = result.ret;

      
      // always process outputs even if node returned failure
      if( !useOutArgsMode ) {
        this.handleOutObject(node, found, result);
      }
    
    }

    if( useOutArgsMode ) {
      this.handleOutArgs(node, found, result);
    }







    // check truthiness, force into boolean
    if( ret ) {
      // console.log(`... with success`);
      return true;
    } else {
      // console.log(`... with failure`);
      return false;
    }
  }

  // see https://medium.com/@kenny.hom27/breadth-first-vs-depth-first-tree-traversal-in-javascript-48df2ebfc6d1#fe0b
  // this is a DFS through the behavior tree (this.exe)
  // we save the current level into the pending[]
  // we use ptr as an index into pending[]
  // based on the node type we destroy or continue our DFS through
  // this requires is to make a copy of exe every time we run through
  // this probably isn't that expensive
  async execute(): Promise<void> {

    if( this.destroyed ) {
      throw new Error("can't call execute() after AsyncBehaviorTree is destroyed");
      return;
    }

    let collection = merge([], this.exe);

    const nesting = this.nestingTypes;

    const pending: any[][] = [[]];
    const types: string[] = [];
    const anypass: boolean[] = [];
    let ptr = -1;

    const popLevel = (): void => {
      pending.pop();
      types.pop();
      anypass.pop();
      ptr--;
    }

    const failUp = (): void => {
      while(ptr >= 0) {

        // fail all the way up
        if( types[ptr] === 'sequence' ) {
          popLevel();
        } else if( types[ptr] === 'fallback' || types[ptr] === 'inverter' || types[ptr] === 'forcesuccess' ) {
          // do nothing, see logic below
          break;
        } else {
          throw new Error(`unhandled pop in failup: ${types[ptr]}`);
        }
      }
    }

    
    while( (ptr > 0) || (ptr > -1 && pending[ptr].length) || collection.length) {
      // debugger;

      if( this.destroyed ) {
        return;
      }

      let node;
      if( ptr > -1 && pending[ptr].length ) {
        node = pending[ptr].shift();
      } else {
        node = collection.shift();
      }

      if(node == undefined) {
        throw new Error(`node cannot be undefined here`);
      }

      if( node.w in nesting ) {
        ptr++;

        if( pending[ptr] && pending[ptr].length ) {
          throw new Error(`pending[ptr] cannot have nodes at creation`);
        }

        pending[ptr] = [];
        types  [ptr] = node.w;
        anypass[ptr] = false;

        pending[ptr].unshift(...node.seq);

        if( this.printCall ) {
          console.log(`nesting ${node.w}`);
        }
      } else if (node.w === 'action') {

        let res = await this.callAction(node);

        if( this.destroyed ) {
          return;
        }

        if( res ) {
          anypass[ptr] = true;
        }

        if(!res) {
          failUp();
        }



      } else if (node.w === 'condition') {
        let res = this.evaluateCondition(node.name);

        if( res ) {
          anypass[ptr] = true;
        }

        if(!res) {
          failUp();
        }


      } else {
        throw new Error(`Unknown walk type: ${node.w}`);
      }

      // if we are empty we need to decide pop behavior
      while( (ptr > 0 && pending[ptr].length == 0) ) {
        // debugger;
        if( types[ptr] === 'fallback' ) {
          const anySaved = anypass[ptr];
          popLevel();
          if( anySaved ) {
            // we got at least 1 pass in our fallback, just move on
          } else {
            // still want the pop, above, but now time to fail up to
            // the next level
            failUp();
          }
        } else if( types[ptr] === 'inverter' ) {
          const anySaved = anypass[ptr];
          popLevel();
          if( anySaved ) {
            failUp();
          }
        } else if( types[ptr] === 'sequence' || types[ptr] === 'forcesuccess' ) {
          popLevel();
          // we are popping a sequence if we get here the sequence succeded
          // we must mark anypass as true for the new level for #35 (part 2)
          anypass[ptr] = true;
        } else {
          throw new Error(`Unknown types in finish pending: ${types[ptr]}`);
        }
        // break; // uncomment to cause issue #35
      }
    } // while(...)
  } // execute

// type: sequence path: 0.0. x: go1
// type: sequence path: 0.1.0. x: stay1
// type: sequence path: 0.2. x: go2

  loadPath(_path, hierarchy: string, x: string, props: any) {

    const exe = this.exe;

    const ps = _path.split('.');
    const hs = hierarchy.split('.');
    const nesting = this.nestingTypes;

    if( ps.length != hs.length ) {
      throw new Error('illegal lengths passed to loadPath()');
    }


    let unpack = exe;

    // istanbul ignore if
    if( this.printParse ) {
      console.log(`path: ${_path} fn: ${x} h: ${hierarchy}`);
    }


    for(let j = 1; j < ps.length; j++) {


      // if we have '0.1.2.3'
      // i is one of the numbers beween periods
      // i progresses as we loop

      const i = parseInt(ps[j-1], 10);

      const type = hs[j];

      if( type in nesting ) {
        if( unpack[i] == undefined ) {
          unpack[i] = {w:type,seq:[]};
        }
      } else if( type === 'action' ) {

        let args = {};
        for( let a in props ) {
          if (a==='ID') {
            continue;
          }
          args[a] = props[a];
        }

        unpack[i] = {w:type,name:x,args};

      } else if( type === 'condition' ) {
        unpack[i] = {w:type,name:x};
      } else {
        throw new Error(`loadPath()[3] Unknown type: ${type}`);
      }

      if( type in nesting ) {
        // console.log('fixme');
        unpack = unpack[i].seq;
      } else if( type === 'action' ) {
        unpack = unpack[i]
      }


    }
  }


  parseResults(err, result) {

    // delete result.root.TreeNodesModel;
    // delete result.root.BehaviorTree;
    // delete result.root.$$[1];
    // delete result.root.$$[0].Sequence;
    // delete result.root.$$[0].Action;
    // delete result.root.$$[0].$$[0].Action;
    // delete result.root.$$[0].$$[0].Sequence;
    // delete result.root.$$[0].$$[0].$$[1].Action;
    // delete result.root.$$[0].$$[0].$$[1].Sequence;

    if( this.debugDoStrip ) {
      this.stripTree(result.root);
    }

    // istanbul ignore if
    if( this.printParse ) {
      console.log("prune");
    }

    this.p = result;
    if( this.printParse ) {
      console.log(this.p);
      console.log(JSON.stringify(result));
    }

    const p = this.p;

    this.grabFunctionParams(p.root);


    let f = p.root.$$[0].$$[0];

    this.recurse(f, 0, "0.", "root.");

    // istanbul ignore if
    if( this.printParse ) {
      console.log(JSON.stringify(this.exe));
      console.log('done');
    }
  }

  recurse(t: any, depth: number, path: string, hierarchy: string) {
    // if(depth === 0) {
    //   debugger;
    // }

    const props = t['$'];
    const children = t['$$'];
    const tag = t['#name'];
    const taglow = tag.toLowerCase();
    const nesting = this.nestingTypes;

    // console.log('key ' + key);

    if( taglow in nesting ) {
      // debugger;
      for(let i = 0; i < children.length; i++) {

        

        const pp = path+i+'.';
        // console.log("calling with path: "+ pp);

        this.recurse(children[i], depth+1, pp, hierarchy+taglow+'.');
      }
    } else if( taglow === 'action' || taglow === 'condition' ) {
      // debugger;
      let fn = props.ID;
      // let a = t[key]; // xml parser likes to put things in 1 depth array
      // this.recurseSeq(t[key][0], depth+1);
      this.loadPath(path+'0', hierarchy+taglow, fn, props);

    } else {
      throw new Error(`Unknown tag: ${tag}`);
    }

  }

  functionDescriptions = {};

  grabFunctionParamsInternal(t: any) {

    const fns = this.functionDescriptions;

    const lut = {
      'input_port': 'in',
      'inout_port': 'inout',
      'output_port': 'out',
    };



    for(let i = 0; i < t.length; i++) {
      const c = t[i];

      const name = c.$.ID;

      if( c.$$ != undefined ) {
        fns[name] = {fn:name, ports:[]};
        for(let j = 0; j < c.$$.length; j++) {
          const arg: any = c.$$[j];
          const argname = arg.$.name;
          const dir = lut[arg['#name']];
          let build: any = {name:argname,dir:dir};
          if( arg.$.default != undefined ) {
            build.default = arg.$.default;
          }
          fns[name].ports.push(build);
        }
      } else {
        fns[name] = {fn:name, ports:[]};
      }
    }
  }

  grabFunctionParams(t: any) {

    if(true) {

      let props = t['$'];
      let children = t['$$'];
      let tag = t['#name'];

      // console.log('key ' + key);

      if( false) {
      } else {
        for(let i = 0; i < children.length; i++) {
          if( children[i]['#name'] === 'TreeNodesModel' ) {
            this.grabFunctionParamsInternal(children[i].$$);
            return;
          }
        }
      }
    }
  }

  // this.grabParams(action) {

  // }

  // when the parser is called with explicitChildren: true, preserveChildrenOrder: true,
  // it returns the information in two formats in the same object
  // this is annoying as I want to see the structure using json stringify
  // so this function strips one copy of the data (the copy in the format I cannot use)
  stripTree(result: any) {
    let doomed: string[] = [];
    
    if(Array.isArray(result)) {
      for(let a of result) {
        this.stripTree(a);
      }
      return;
    }


    for(let key in result) {
      if (!result.hasOwnProperty(key)) {
        continue;       // skip this property
      }

      if( key === '$' || key === '$$' || key === '#name' || key === 'name' || key === 'ID' || key === 'default' ) {
        continue;
      }

      doomed.push(key);
    }

    for(let d of doomed) {
      delete result[d];
    }


    for(let key in result) {
      if (!result.hasOwnProperty(key)) {
        continue;       // skip this property
      }

      if( key === '$' || key === '$$' ) {
      } else {
        continue;
      }

      this.stripTree(result[key]);

    }

  }


}


export {
AsyncBehaviorTree
}
