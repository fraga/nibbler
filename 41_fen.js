"use strict";

function LoadFEN(fen) {

	let ret = NewPosition();

	fen = ReplaceAll(fen, "\t", " ");
	fen = ReplaceAll(fen, "\n", " ");
	fen = ReplaceAll(fen, "\r", " ");

	let tokens = fen.split(" ").filter(s => s !== "");

	if (tokens.length !== 6) {
		throw "Invalid FEN - token count";
	}

	let rows = tokens[0].split("/");

	if (rows.length !== 8) {
		throw "Invalid FEN - board row count";
	}

	for (let y = 0; y < 8; y++) {

		let chars = Array.from(rows[y]);

		let x = 0;

		for (let c of chars) {

			if (x > 7) {
				throw "Invalid FEN - row length";
			}

			if ("12345678".includes(c)) {
				x += parseInt(c, 10);
				continue;
			}

			if ("KkQqRrBbNnPp".includes(c)) {
				ret.state[x][y] = c;
				x++;
				continue;
			}

			throw "Invalid FEN - unknown piece";
		}

		if (x !== 8) {
			throw "Invalid FEN - row length";
		}
	}

	tokens[1] = tokens[1].toLowerCase();
	if (tokens[1] !== "w" && tokens[1] !== "b") {
		throw "Invalid FEN - active player";
	}
	ret.active = tokens[1];

	ret.castling = "";
	if (tokens[2].includes("K")) ret.castling += "K";
	if (tokens[2].includes("Q")) ret.castling += "Q";
	if (tokens[2].includes("k")) ret.castling += "k";
	if (tokens[2].includes("q")) ret.castling += "q";

	// Tolerate bad castling rights, but fix them...

	if (ret.castling.includes("K")) {
		if (ret.state[4][7] !== "K" || ret.state[7][7] !== "R") {
			ret.castling = ReplaceAll(ret.castling, "K", "");
		}
	}
	if (ret.castling.includes("Q")) {
		if (ret.state[4][7] !== "K" || ret.state[0][7] !== "R") {
			ret.castling = ReplaceAll(ret.castling, "Q", "");
		}
	}
	if (ret.castling.includes("k")) {
		if (ret.state[4][0] !== "k" || ret.state[7][0] !== "r") {
			ret.castling = ReplaceAll(ret.castling, "k", "");
		}
	}
	if (ret.castling.includes("q")) {
		if (ret.state[4][0] !== "k" || ret.state[0][0] !== "r") {
			ret.castling = ReplaceAll(ret.castling, "q", "");
		}
	}

	tokens[3] = tokens[3].toLowerCase();
	ret.enpassant = Point(tokens[3]);
	
	ret.halfmove = parseInt(tokens[4], 10);
	if (Number.isNaN(ret.halfmove)) {
		throw "Invalid FEN - halfmoves";
	}

	ret.fullmove = parseInt(tokens[5], 10);
	if (Number.isNaN(ret.fullmove)) {
		throw "Invalid FEN - fullmoves";
	}

	// Some more validity checks...

	let white_kings = 0;
	let black_kings = 0;

	for (let x = 0; x < 8; x++) {
		for (let y = 0; y < 8; y++) {
			if (ret.state[x][y] === "K") white_kings++;
			if (ret.state[x][y] === "k") black_kings++;
		}
	}

	if (white_kings !== 1 || black_kings !== 1) {
		throw "Invalid FEN - number of kings";
	}

	for (let x = 0; x < 8; x++) {
		for (let y of [0, 7]) {
			if (ret.state[x][y] === "P" || ret.state[x][y] === "p") {
				throw "Invalid FEN - pawn position";
			}
		}
	}

	let opponent_king_char = ret.active === "w" ? "k" : "K";
	let opponent_king_square = ret.find(opponent_king_char)[0];

	if (ret.attacked(opponent_king_square, ret.colour(opponent_king_square))) {
		throw "Invalid FEN - non-mover's king in check";
	}

	return ret;
}
