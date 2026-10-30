"use client";

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faCircleCheck, faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

export default function GoogleCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Đang liên kết tài khoản Google...");

  useEffect(() => {
    try {
      // 1. Kiểm tra URL Hash (#access_token=...&id_token=...) hoặc Query Params (?code=...)
      const hash = window.location.hash.substring(1);
      const search = window.location.search.substring(1);
      const params = new URLSearchParams(hash || search);

      const accessToken = params.get("access_token");
      const idToken = params.get("id_token");
      const error = params.get("error");
      const errorDescription = params.get("error_description");

      if (error) {
        setStatus("error");
        setMessage(errorDescription || "Người dùng đã hủy hoặc từ chối cấp quyền.");
        if (window.opener) {
          window.opener.postMessage(
            { type: "GOOGLE_AUTH_ERROR", message: errorDescription || error },
            window.location.origin
          );
        }
        setTimeout(() => window.close(), 1800);
        return;
      }

      if (accessToken || idToken) {
        setStatus("success");
        setMessage("Xác thực Google thành công! Đang chuyển tiếp...");

        // Gửi thông điệp chứa token về cửa sổ chính
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "GOOGLE_AUTH_SUCCESS",
              accessToken,
              idToken,
            },
            window.location.origin
          );
        }

        // Tự động đóng popup sau 500ms
        setTimeout(() => {
          window.close();
        }, 500);
      } else {
        setStatus("error");
        setMessage("Không tìm thấy mã xác thực từ phản hồi của Google.");
        setTimeout(() => window.close(), 2000);
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Đã xảy ra lỗi trong quá trình xử lý callback.");
      setTimeout(() => window.close(), 2000);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#070e0a] text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
      <div className="w-full max-w-sm p-8 rounded-3xl bg-[#0e1d14]/90 border border-[#d4af37]/30 shadow-2xl backdrop-blur-xl flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center mb-5 shadow-inner">
          <FontAwesomeIcon icon={faGoogle} className="w-7 h-7 text-rose-400" />
        </div>

        <h2 className="text-base font-semibold tracking-wider text-white uppercase font-mono">
          Google Identity Gateway
        </h2>
        <p className="text-xs text-white/60 mt-2 mb-6 font-light font-mono leading-relaxed">
          {message}
        </p>

        {status === "loading" && (
          <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 text-[#d4af37] animate-spin" />
        )}
        {status === "success" && (
          <FontAwesomeIcon icon={faCircleCheck} className="w-6 h-6 text-emerald-400 animate-bounce" />
        )}
        {status === "error" && (
          <FontAwesomeIcon icon={faCircleExclamation} className="w-6 h-6 text-rose-400" />
        )}

        <div className="text-[10px] font-mono text-white/40 mt-8 tracking-widest uppercase">
          BRU_WATCH • SWISS BOUTIQUE
        </div>
      </div>
    </div>
  );
}
