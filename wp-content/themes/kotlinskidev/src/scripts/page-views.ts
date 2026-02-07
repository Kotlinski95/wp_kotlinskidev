(function () {
  if (!(window as any).kotlinskidev_ajax) {
    return;
  }

  const getPostId = (): number | null => {
    const metaTag = document.querySelector('meta[name="post-id"]') as HTMLMetaElement;
    if (metaTag && metaTag.content) {
      const id = parseInt(metaTag.content, 10);
      if (!isNaN(id)) return id;
    }

    const bodyClasses = document.body.className.split(" ");
    for (const className of bodyClasses) {
      if (className.startsWith("postid-") || className.startsWith("page-id-")) {
        const id = parseInt(className.replace(/^(postid-|page-id-)/, ""), 10);
        if (!isNaN(id)) return id;
      }
    }

    return null;
  };

  const postId = getPostId();
  if (!postId) {
    return;
  }

  const trackPageView = () => {
    const storageKey = `pv_${postId}_${new Date().toDateString()}`;

    if (localStorage.getItem(storageKey)) {
      return;
    }

    localStorage.setItem(storageKey, "1");

    const xhr = new XMLHttpRequest();
    xhr.open("POST", (window as any).kotlinskidev_ajax?.ajaxurl || "/wp-admin/admin-ajax.php");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    const formData = new URLSearchParams({
      action: "kotlinskidev_track_page_view",
      post_id: postId.toString(),
      nonce: (window as any).kotlinskidev_ajax?.nonce || "",
    });

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
        } catch (e) {
          console.error(`Something went wrong during increasing page view for page: ${postId}`);
        }
      }
    };

    xhr.send(formData.toString());
  };

  let hasScrolled = false;
  let timeSpent = 0;
  const startTime = Date.now();

  const trackView = () => {
    timeSpent = Date.now() - startTime;

    if (timeSpent >= 3000 || hasScrolled) {
      trackPageView();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    }
  };

  const onScroll = () => {
    if (window.scrollY > 100) {
      hasScrolled = true;
      trackView();
    }
  };

  const onVisibilityChange = () => {
    if (document.hidden) {
      trackView();
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVisibilityChange);

  setTimeout(trackView, 10000);
})();
