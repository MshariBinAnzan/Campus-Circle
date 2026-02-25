"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "ar";

export const translations = {
    en: {
        // Nav
        appName: "CampusCircle",
        feed: "Feed",
        search: "Search",
        messages: "Messages",
        clubs: "Clubs",
        courses: "Courses",
        profile: "Profile",
        moderation: "Moderation",
        signOut: "Sign out",
        // Feed
        whatsOnMind: "What's on your mind?",
        post: "Post",
        photo: "Photo",
        backToFeed: "← Back to feed",
        noPosts: "Nothing here yet",
        beFirst: "Be the first to post!",
        searchPlaceholder: "Search posts and people…",
        // Top posts
        topToday: "Top Posts Today",
        noTopPosts: "No posts today yet",
        // FAQ
        faqTitle: "FAQ",
        faqQ1: "Why can't I sign up with Gmail?",
        faqA1: "Only verified Almaarefa University students with a valid @student.um.edu.sa email address can create an account.",
        faqQ2: "How do I report a post?",
        faqA2: "Tap the ⋯ menu on any post and select 'Report'. Our moderation team will review it within 24 hours.",
        faqQ3: "How can I enter clubs?",
        faqA3: "You can enter by searching the club you want and request to join, then the leader will decide whether to accept or not.",
        faqQ4: "How do I update my profile?",
        faqA4: "Click your avatar in the bottom-left navigation bar, then select 'Edit Profile' to change your name, bio, or avatar.",
        // Post actions
        like: "Like",
        comment: "Comment",
        report: "Report",
        delete: "Delete",
        deletePost: "Delete post",
        // Comments
        comments: "Comments",
        noComments: "No comments yet. Start the conversation.",
        writeComment: "Write a comment…",
        // Profile
        joined: "Joined",
        posts: "Posts",
        followers: "Followers",
        following: "Following",
        likesReceived: "Likes received",
        editProfile: "Edit Profile",
        displayName: "Display Name",
        saveChanges: "Save Changes",
        changePhoto: "Change photo",
        follow: "Follow",
        following_btn: "Following",
        message: "Message",
        // Clubs
        allClubs: "All Clubs",
        myClubs: "My Clubs",
        createClub: "Create Club",
        joinClub: "Request to Join",
        requestSent: "Request Sent",
        member: "Member",
        pendingRequests: "Pending Requests",
        approve: "Approve",
        decline: "Decline",
        clubChat: "Club Chat",
        clubDescription: "Description",
        clubName: "Club Name",
        clubEmoji: "Emoji",
        createClubBtn: "Create Club",
        noClubs: "No clubs yet. Create the first one!",
        typeMessage: "Type a message…",
        membersCount: "members",
        // Auth
        welcomeBack: "Welcome back",
        signInUniversity: "Sign in with your email",
        email: "Email",
        password: "Password",
        signIn: "Sign In",
        noAccount: "No account?",
        signUp: "Sign up",
        createAccount: "Create account",
        displayNameLabel: "Display Name",
        haveAccount: "Already have an account?",
        // Search
        people: "People",
        searchForPeople: "Search for people by name or find posts by keyword",
        noResults: "No results for",
        // Messages
        noMessages: "No messages yet",
        visitProfile: "Visit someone's profile to send them a message.",
        // Report
        reportPost: "Report Post",
        whyReport: "Why are you reporting this post?",
        submitReport: "Submit Report",
        reportSubmitted: "✓ Report submitted. Thank you.",
        // Mod
        modDashboard: "Moderation Dashboard",
        pending: "Pending",
        reviewed: "Reviewed",
        dismissed: "Dismissed",
        all: "All",
        admin: "Admin",
        // Landing
        yourCircle: "Your circle.",
        yourUniversity: "Your university.",
        // 404
        notFound: "404 — Not Found",
        notFoundDesc: "That page doesn't exist or was removed.",
        goHome: "Go Home",
    },
    ar: {
        // Nav
        appName: "CampusCircle",
        feed: "المنشورات",
        search: "البحث",
        messages: "الرسائل",
        clubs: "النوادي",
        courses: "المجموعات الدراسية",
        profile: "ملفي",
        moderation: "الإشراف",
        signOut: "تسجيل الخروج",
        // Feed
        whatsOnMind: "ماذا يدور في ذهنك؟",
        post: "نشر",
        photo: "صورة",
        backToFeed: "→ العودة إلى المنشورات",
        noPosts: "لا يوجد شيء هنا بعد",
        beFirst: "كن أول من ينشر!",
        searchPlaceholder: "ابحث عن منشورات و أشخاص…",
        // Top posts
        topToday: "افضل بوستات لليوم",
        noTopPosts: "لا توجد منشورات اليوم بعد",
        // FAQ
        faqTitle: "الاسئلة الشائعة",
        faqQ1: "لماذا لا أستطيع التسجيل ببريد Gmail؟",
        faqA1: "يمكن فقط لطلاب جامعة المعارف المعتمدين الذين يمتلكون بريدًا إلكترونيًا صحيحًا بنهاية @student.um.edu.sa إنشاء حساب.",
        faqQ2: "كيف أبلغ عن منشور؟",
        faqA2: "اضغط على قائمة ⋯ في أي منشور واختر 'إبلاغ'. سيراجعه فريق الإشراف خلال 24 ساعة.",
        faqQ3: "كيف يمكنني الانضمام للنوادي؟",
        faqA3: "يمكنك الانضمام عن طريق البحث عن النادي الذي تريده وطلب الانضمام، ثم يقرر القائد قبولك من عدمه.",
        faqQ4: "كيف أحدّث ملفي الشخصي؟",
        faqA4: "انقر على صورتك في شريط التنقل واختر 'تعديل الملف الشخصي' لتغيير اسمك أو صورتك.",
        // Post actions
        like: "إعجاب",
        comment: "تعليق",
        report: "إبلاغ",
        delete: "حذف",
        deletePost: "حذف المنشور",
        // Comments
        comments: "التعليقات",
        noComments: "لا تعليقات بعد. ابدأ المحادثة.",
        writeComment: "اكتب تعليقاً…",
        // Profile
        joined: "انضم في",
        posts: "المنشورات",
        followers: "المتابعون",
        following: "يتابع",
        likesReceived: "الإعجابات المستلمة",
        editProfile: "تعديل الملف الشخصي",
        displayName: "الاسم المعروض",
        saveChanges: "حفظ التغييرات",
        changePhoto: "تغيير الصورة",
        follow: "متابعة",
        following_btn: "تتابع",
        message: "رسالة",
        // Clubs
        allClubs: "جميع النوادي",
        myClubs: "ناديّاتي",
        createClub: "إنشاء نادٍ",
        joinClub: "طلب الانضمام",
        requestSent: "تم إرسال الطلب",
        member: "عضو",
        pendingRequests: "الطلبات المعلقة",
        approve: "قبول",
        decline: "رفض",
        clubChat: "محادثة النادي",
        clubDescription: "الوصف",
        clubName: "اسم النادي",
        clubEmoji: "رمز تعبيري",
        createClubBtn: "إنشاء النادي",
        noClubs: "لا توجد نوادٍ بعد. أنشئ أول نادٍ!",
        typeMessage: "اكتب رسالة…",
        membersCount: "أعضاء",
        // Auth
        welcomeBack: "مرحباً بعودتك",
        signInUniversity: "سجّل دخولك ببريدك الجامعي",
        email: "البريد الإلكتروني",
        password: "كلمة المرور",
        signIn: "تسجيل الدخول",
        noAccount: "ليس لديك حساب؟",
        signUp: "سجّل",
        createAccount: "إنشاء حساب",
        displayNameLabel: "الاسم المعروض",
        haveAccount: "لديك حساب بالفعل؟",
        // Search
        people: "أشخاص",
        searchForPeople: "ابحث عن أشخاص بالاسم أو منشورات بالكلمات المفتاحية",
        noResults: "لا نتائج لـ",
        // Messages
        noMessages: "لا رسائل بعد",
        visitProfile: "زُر ملف شخص لإرسال رسالة إليه.",
        // Report
        reportPost: "الإبلاغ عن المنشور",
        whyReport: "لماذا تُبلّغ عن هذا المنشور؟",
        submitReport: "إرسال البلاغ",
        reportSubmitted: "✓ تم إرسال البلاغ. شكراً لك.",
        // Mod
        modDashboard: "لوحة الإشراف",
        pending: "قيد الانتظار",
        reviewed: "تمت المراجعة",
        dismissed: "مرفوض",
        all: "الكل",
        admin: "مشرف",
        // Landing
        yourCircle: "دائرتك.",
        yourUniversity: "جامعتك.",
        // 404
        notFound: "٤٠٤ — الصفحة غير موجودة",
        notFoundDesc: "هذه الصفحة غير موجودة أو تمت إزالتها.",
        goHome: "العودة للرئيسية",
    },
};

type Translations = typeof translations.en;

interface LangContextType {
    lang: Lang;
    setLang: (l: Lang) => void;
    t: Translations;
}

const LangContext = createContext<LangContextType>({
    lang: "en",
    setLang: () => { },
    t: translations.en,
});

// Applies lang/dir directly to the <html> element (client-only, called after mount)
function applyLang(l: Lang) {
    document.documentElement.lang = l;
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<Lang>("en");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Mark as mounted FIRST, then load the saved language.
        // This ensures the initial client render matches the server render (lang='en').
        const saved = localStorage.getItem("lang") as Lang | null;
        if (saved === "ar" || saved === "en") {
            applyLang(saved);
            setLangState(saved);
        }
        setMounted(true);
    }, []);

    function setLang(l: Lang) {
        setLangState(l);
        localStorage.setItem("lang", l);
        applyLang(l);
    }

    // Before mount: always serve English so the client matches the server's SSR output.
    // After mount: serve the real saved language.
    const value = {
        lang: mounted ? lang : "en" as Lang,
        setLang,
        t: mounted ? translations[lang] : translations.en,
    };

    return (
        <LangContext.Provider value={value}>
            {children}
        </LangContext.Provider>
    );
}

export function useLang() {
    return useContext(LangContext);
}
