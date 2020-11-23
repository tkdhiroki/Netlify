/* 
 * 生WebGLで三角形を描画する
 * 
 * # 処理の流れ
 * 1. CanvasDOM取得 & WebGLコンテキストを取得とセットアップ
 * 2. 頂点シェーダコンパイル、フラグメントシェーダコンパイル
 * 3. WebGLProgramの生成、シェーダのアタッチとリンク、有効化
 * 4. 三角ポリゴンの頂点バッファ生成
 * 5. 背景描画
 * 6. ビューポートの設定
 * 7. 頂点属性を有効化してデータを注入
 * 8. 描画する
 * 
 */
window.onload = function ()
{
	// ======== Start 1.CanvasDOM取得 & WebGLコンテキストを取得とセットアップ ========
	var key = 'canvas';                         // html内のIDを設定
	var canvas = document.getElementById (key); // IDを探して要素にアクセスする
	var gl = canvas.getContext('webgl', null);  // webglコンテキストを要求、利用できなかったらnullで終了
	var size = Math.min(window.innerWidth, window.innerHeight) / 2;　// ブラウザウィンドウのviewportの幅ピクセル、縦幅の小さい方をsize
	canvas.width = size;    // canvasのsizeを決める。
	canvas.height = size;
	// ======== End 1.CanvasDOM取得 & WebGLコンテキストを取得とセットアップ ========
	
	
	// ======== Start 2.頂点シェーダコンパイル、フラグメントシェーダコンパイル ========
	var vsElement = document.getElementById ('vs');
    var vs = null;
    // HTMLElement.type -> html内のIDに付属するtypeを取得
	if (vsElement.type == 'x-shader/x-vertex') {
		vs = gl.createShader(gl.VERTEX_SHADER); // 
	}
    // シェーダオブジェクトに頂点シェーダーを代入
    // html内のtextをstringとして貰いソースコードをvsに入れる
	gl.shaderSource(vs, vsElement.text);
	// 頂点シェーダをコンパイル
	gl.compileShader(vs);
	
	var fsElement = document.getElementById('fs');
	var fs = null;
	if (fsElement.type == 'x-shader/x-fragment') {
		fs = gl.createShader(gl.FRAGMENT_SHADER);
	}
	// シェーダオブジェクトにフラグメントシェーダを代入
	gl.shaderSource(fs, fsElement.text);
	// フラグメントシェーダをコンパイル
	gl.compileShader (fs);
	// ======== End 2.頂点シェーダコンパイル、フラグメントシェーダコンパイル ========
	
	
	// ======== Start 3.WebGLProgramの生成、シェーダのアタッチとリンク、有効化 ========
	// WebGLProgram
	var program = gl.createProgram();
	// WebGLProgramに頂点シェーダーを紐付ける
	gl.attachShader(program, vs);
	// WebGLProgramにフラグメントシェーダーを紐付ける
	gl.attachShader(program, fs);
	// WebGLProgramに紐付けられた、頂点シェーダとフラグメントシェーダをWebGLProgramにリンクさせる
	gl.linkProgram (program);
    // WebGLProgramのパラメータを取得する
    // LINK_STATUSは最後のリンク操作が成功したかboolで返す
	if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
		// WebGLProgramを有効化する。programを現在の描画ステートの一部として設定する。
		gl.useProgram(program);
	}else {
        // リンク失敗時にエラーログを発生する
		console.log (gl.getProgramInfoLog(program));
		return;
	}
	// ======== End 3.WebGLProgramの生成、シェーダのアタッチとリンク、有効化 ========
	
	
	// ======== Start 4.三角ポリゴンの頂点バッファ生成 ========
	// 三角ポリゴンの頂点バッファを生成
	// 空のバッファ生成
	var positionBuffer = gl.createBuffer();
    // 生成したバッファをバインドする。ARRAY_BUFFERに結合する
    // ARRAY_BUFFER->頂点の属性を含むバッファー
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	var position = [
		0, 0.5, 0,          // 上の頂点
		-0.5, -0.5, 0,      // 左下の頂点
		0.5 ,-0.5, 0        // 右下の頂点
	];
    // バインドされたバッファに三角ポリゴンのデータをセットする
    // STATIC_DRAW->bufferへ書き込まれるが読みだせない。よく使われるが、変更はあまりされない
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array (position), gl.STATIC_DRAW);
	// バインド解除 errorの予防線
	// バインドは１つのbufferのみなのでnullで解除する
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	// ======== End 4.三角ポリゴンの頂点バッファ生成 ========

	// 描画開始
	render ();

	function render ()
	{
		// ======== Start 5.背景描画 ========
		// 背景描画　gl.clearColor(red, green, blue, alpha);
		gl.clearColor (0.8, 0.8, 0.8, 1.0);
        // バッファをクリアする
        // COLOR_BUFFER_BIT->ビット論理和マスク
		gl.clear (gl.COLOR_BUFFER_BIT);
		// ======== End 5.背景描画 ========

        // ======== Start 6.ビューポートの設定 ========
        // 表示領域を設定します。（x、y、w、h）
		gl.viewport(0, 0, size, size);
		// ======== End 6.ビューポートの設定 ========
		
		
		// ======== Start 7.頂点属性を有効化してデータを注入 ========
		// 三角ポリゴン頂点バッファをバインド
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        // 頂点シェーダのアドレスを保持
		//各シェーダをリンクさせたprogramオブジェクトから該当の変数のインデックス（Location）を取得
		// canvas内のattribute vec3 position を取得
		var positionAddress = gl.getAttribLocation(program, "position");
        // 頂点属性を有効化する
        // 個々の頂点を頂点バッファから頂点シェーダ関数に渡すためにWebGLレイヤによって使用される属性をアクティブにする
		gl.enableVertexAttribArray(positionAddress);
		// 頂点属性に頂点データを設定する
		gl.vertexAttribPointer(positionAddress, 3, gl.FLOAT, false, 0, 0);
		// ======== End 7.頂点属性を有効化してデータを注入 ========
		
		
		// ======== Start 8.描画する ========
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
		// ======== End 8.描画する ========
	}
};
