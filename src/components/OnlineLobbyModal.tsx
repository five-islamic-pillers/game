import React, { useState } from 'react';
import { 
  Users, 
  Globe2, 
  Copy, 
  Check, 
  Play, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  Crown, 
  LogOut,
  Settings
} from 'lucide-react';
import { 
  createOnlineRoom, 
  joinOnlineRoom, 
  subscribeToRoom, 
  updateOnlineRoomState 
} from '../services/onlineGameService';
import type { OnlineRoomData, GameDifficulty, CardTypes } from '../types';

interface OnlineLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGameStart: (roomCode: string, myPlayerId: string, initialRoom: OnlineRoomData) => void;
}

export const OnlineLobbyModal: React.FC<OnlineLobbyModalProps> = ({
  isOpen,
  onClose,
  onGameStart
}) => {
  const [tab, setTab] = useState<'menu' | 'create' | 'join' | 'waiting'>('menu');
  const [playerName, setPlayerName] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');
  const [cardTypesAllowed, setCardTypesAllowed] = useState<CardTypes>('both');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Active room state while in waiting room
  const [activeRoom, setActiveRoom] = useState<OnlineRoomData | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setErrorMsg('تکایە ناوی خۆت بنووسە');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const { roomCode, playerId } = await createOnlineRoom(playerName, difficulty, cardTypesAllowed);
      setMyPlayerId(playerId);
      setTab('waiting');

      // Listen to room updates
      subscribeToRoom(roomCode, (roomData) => {
        if (!roomData) {
          setErrorMsg('ژوورەکە داخرا یان سڕایەوە');
          setTab('menu');
          return;
        }
        setActiveRoom(roomData);
        if (roomData.status === 'playing') {
          onGameStart(roomCode, playerId, roomData);
        }
      });
    } catch (err: any) {
      setErrorMsg('هەڵەیەک ڕوویدا لە دروستکردنی ژوور. تکایە دووبارە هەوڵبدەرەوە.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setErrorMsg('تکایە ناوی خۆت بنووسە');
      return;
    }
    if (!roomCodeInput.trim()) {
      setErrorMsg('تکایە کۆدی ژوورەکە بنووسە');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await joinOnlineRoom(roomCodeInput.trim(), playerName);
      if ('error' in res) {
        setErrorMsg(res.error);
        setLoading(false);
        return;
      }
      setMyPlayerId(res.playerId);
      setTab('waiting');

      // Listen to room updates
      subscribeToRoom(roomCodeInput.trim(), (roomData) => {
        if (!roomData) {
          setErrorMsg('ژوورەکە نەما یان داخرا.');
          setTab('menu');
          return;
        }
        setActiveRoom(roomData);
        if (roomData.status === 'playing') {
          onGameStart(roomCodeInput.trim(), res.playerId, roomData);
        }
      });
    } catch (err: any) {
      setErrorMsg('نەتوانرا پەیوەندی بە ژوورەوە بکرێت.');
    } finally {
      setLoading(false);
    }
  };

  const handleHostStartGame = async () => {
    if (!activeRoom || !myPlayerId) return;
    if (activeRoom.players.length < 2) {
      setErrorMsg('بۆ دەستپێکردن پێویستە بەلایەنی کەم ٢ یاریزان لە ژووردا بن.');
      return;
    }
    setLoading(true);
    try {
      await updateOnlineRoomState(activeRoom.roomCode, {
        status: 'playing',
        currentPlayerIndex: 0,
        turnPhase: 'choose_card',
        timeLeft: 30
      });
    } catch (err) {
      setErrorMsg('نەتوانرا یاری دەستپێبکرێت.');
    } finally {
      setLoading(false);
    }
  };

  const copyRoomCode = () => {
    if (activeRoom) {
      navigator.clipboard.writeText(activeRoom.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isHost = activeRoom?.hostId === myPlayerId;

  return (
    <div 
      id="online-lobby-modal-backdrop"
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="online-lobby-modal-content"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-stone-900 border border-amber-500/40 rounded-3xl p-6 md:p-8 text-white shadow-2xl overflow-hidden my-auto"
      >
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 flex items-center justify-center shadow-lg shadow-amber-900/40">
              <Globe2 className="w-6 h-6 text-stone-950" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Real-time Multiplayer</span>
              <h2 className="text-xl md:text-2xl font-black text-white">یاریکردنی ئۆنلاین</h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition-colors"
          >
            داخستن
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-5 p-3.5 bg-red-500/20 border border-red-500/40 rounded-xl flex items-center gap-2.5 text-red-200 text-sm font-bold">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab 1: Menu (Choose Create or Join) */}
        {tab === 'menu' && (
          <div className="space-y-4">
            <p className="text-stone-300 text-sm leading-relaxed mb-6 font-medium">
              هاوڕێ و خێزانەکەت بەشداری پێبکە لە هەر شوێنێک بن! دەتوانیت ژوورێکی نوێ دروست بکەیت یان بە کۆد بچیتە ژووری هاوڕێکەت.
            </p>

            <button
              id="online-create-room-btn"
              onClick={() => { setErrorMsg(null); setTab('create'); }}
              className="w-full p-5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 active:scale-[0.98] rounded-2xl shadow-xl flex items-center justify-between text-white font-bold transition-all border border-amber-400/30 group cursor-pointer"
            >
              <div className="flex items-center gap-4 text-right">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white group-hover:text-amber-100">دروستکردنی ژووری نوێ</h3>
                  <p className="text-xs text-amber-200/80 font-normal">تۆ دەبیتە هۆست (کۆنتڕۆڵکەری ژوور) و کۆد بە هاوڕێکانت دەدەیت</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/70 group-hover:-translate-x-1 transition-transform" />
            </button>

            <button
              id="online-join-room-btn"
              onClick={() => { setErrorMsg(null); setTab('join'); }}
              className="w-full p-5 bg-stone-800/90 hover:bg-stone-800 active:scale-[0.98] rounded-2xl shadow-lg flex items-center justify-between text-white font-bold transition-all border border-stone-700 group cursor-pointer"
            >
              <div className="flex items-center gap-4 text-right">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white group-hover:text-indigo-200">چوونەژوورەوە بە کۆد</h3>
                  <p className="text-xs text-stone-400 font-normal">کۆدی ٤ ژمارەیی ژوورەکەت لێبدە و ڕاستەوخۆ دەست پێبکە</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-stone-400 group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* Tab 2: Create Room Form */}
        {tab === 'create' && (
          <form onSubmit={handleCreateRoom} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-2">ناوی تۆ (وەک هۆست):</label>
              <input 
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="بۆ نموونە: دیار"
                maxLength={20}
                required
                className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-amber-500 font-bold placeholder-stone-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-stone-400 mb-2">ئاستی پرسیارەکان:</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as GameDifficulty)}
                  className="w-full px-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs font-bold text-stone-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="easy">ئاسان</option>
                  <option value="medium">مامناوەند</option>
                  <option value="hard">قورس</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-400 mb-2">جۆری کارتەکان:</label>
                <select
                  value={cardTypesAllowed}
                  onChange={(e) => setCardTypesAllowed(e.target.value as CardTypes)}
                  className="w-full px-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs font-bold text-stone-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="both">هەردووکیان (هەڵبژاردن و زانین)</option>
                  <option value="brainteaser">تەنها کارتی هەڵبژاردن</option>
                  <option value="guess">تەنها کارتی زانین</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => setTab('menu')}
                className="py-3 px-5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl text-sm transition-colors"
              >
                گەڕانەوە
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-5 bg-amber-600 hover:bg-amber-500 active:scale-[0.98] text-white font-black rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-900/40 disabled:opacity-60 cursor-pointer"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                <span>دروستکردنی ژوور</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Join Room Form */}
        {tab === 'join' && (
          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-2">ناوی تۆ:</label>
              <input 
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="بۆ نموونە: شایی"
                maxLength={20}
                required
                className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-bold placeholder-stone-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-2">کۆدی ژوور (٤ ژمارە):</label>
              <input 
                type="text"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value)}
                placeholder="وەک: 5821"
                maxLength={6}
                required
                className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-center tracking-widest text-2xl font-black text-amber-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => setTab('menu')}
                className="py-3 px-5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl text-sm transition-colors"
              >
                گەڕانەوە
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-black rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/40 disabled:opacity-60 cursor-pointer"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Users className="w-5 h-5" />}
                <span>چوونەژوورەوە</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 4: Waiting Room Lobby */}
        {tab === 'waiting' && activeRoom && (
          <div className="space-y-6">
            {/* Room Code Display */}
            <div className="p-4 bg-stone-800/90 border border-amber-500/40 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">کۆدی ژوورەکەت</span>
                <span className="text-3xl font-black text-white tracking-widest">{activeRoom.roomCode}</span>
              </div>
              <button
                onClick={copyRoomCode}
                className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 active:scale-95 border border-amber-500/40 text-amber-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'کۆپیکرا!' : 'کۆپیکردنی کۆد'}</span>
              </button>
            </div>

            {/* Players Joined List */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-stone-400 mb-3">
                <span>یاریزانانی بەشداربوو ({activeRoom.players.length}/6):</span>
                <span className="text-amber-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  ڕاستەوخۆ دەبەسترێتەوە
                </span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {activeRoom.players.map((p, idx) => (
                  <div 
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-stone-800 border border-stone-700/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${p.color} border border-white/40 shadow-sm`} />
                      <span className="font-bold text-white text-sm">
                        {p.name} {p.id === myPlayerId && <span className="text-xs text-amber-400">(تۆ)</span>}
                      </span>
                    </div>
                    {p.id === activeRoom.hostId && (
                      <span className="flex items-center gap-1 text-[11px] font-black bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                        <Crown className="w-3 h-3" /> هۆست
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Host or Member Actions */}
            <div className="pt-2 border-t border-stone-800">
              {isHost ? (
                <div className="space-y-2">
                  <button
                    onClick={handleHostStartGame}
                    disabled={activeRoom.players.length < 2 || loading}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 active:scale-[0.98] text-white font-black rounded-2xl shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-base border border-emerald-400/30 cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                    <span>دەستپێکردنی یاری ({activeRoom.players.length} یاریزان)</span>
                  </button>
                  {activeRoom.players.length < 2 && (
                    <p className="text-center text-xs text-amber-400/90 font-medium">
                      چاوەڕێی هاتنی بەلایەنی کەم یاریزانێکی تر بکە...
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-stone-800/80 rounded-2xl text-center border border-stone-700">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-400 mx-auto mb-2" />
                  <p className="font-bold text-white text-sm">چاوەڕوانی هۆست بکە بۆ دەستپێکردنی یارییەکە...</p>
                  <p className="text-xs text-stone-400 mt-1">کاتێک هۆست دەستی پێکرد، ڕاستەوخۆ دەچیتە ناو تەختەی یاری.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
