# CONTEXT — новый чат

Обновлено 2026-11-12. Кодовая точка перед этим docs-only пакетом: 30b51e2be09edb90082687af99d98b7bca470cc8/main, runtime 0.9.6. Полный свежий CI и публикация Pages не подтверждены. Читать CONTEXT → TODO → docs/handoff-unified-cards.md, затем ARCHITECTURE/ROADMAP/README/docs/review-principles.md. Старые чаты заново не загружать.

## Последние решения и результат

- 1ff3c7f868818258fb76f58b8ec04f36c5adcec2: depthWrite=true только у отдельной volume/skull/piglin_head, без parts. Пользователь на телефоне: при повороте больше ничего не пропадает. Сохранять. Прозрачность/alphaTest/UV/текстуры не менялись; glass/прочие головы/bed/sprite/multipart не переключены.
- 11b13e77798dd020a4519b20594773b97a14a884: HEAD_INFLATE=0 вместо -0.02 у головы/пятачка/двух клыков; уши/центры/UV прежние. Пользователь: лучше, но не идеально. Остаточные зазоры открыты; не округлять все модели.
- 30b51e2: app/index/preview и local JS/CSS versions 0.9.6; import maps версионируют prepared-preview/materials/piglin-head, НЕ весь граф.
- Ассистент ошибочно добавил p#fkBuild в app.html/s-home. Версия УЖЕ была вверху стартовой страницы. Удалить только дубль; сейчас он ещё есть. Этот пакет не меняет UI/runtime. При будущих видимых правках повышать версию и соответствующие URL, не добавлять badges.
- #30312b — пожелание ТОЛЬКО к фону макета, пока НЕ применено. Остальные тона/Back red#866065 не утверждены.
- Cyan bed: нижнее длинное ребро над планкой со швом; не исправлено, низкий приоритет, можно отложить. Низ бокса/верх планки y=-0.3125 совпадают, но это не GPU-приёмка. Видимая сторона не сопоставлена с east/west.

## Проверки и ограничения

6463fb0 atlas test упал до браузера на PNG дракона/404. 804f875 использует dragon.tga и прежний loadAny. 5fcaa6c исправил зависимости UI tests (настоящие slotIconLabels/iconLabelsForSet) и exact18/provenance bubble sprite вместо устаревших19. Старый 0_build.txt:750/754 pass,4 fail; новый полный CI не получен.

10db8cd piglin visibility report:5×48 программных WebGL2/Chromium кадров, antialias=true, errors=[], один geometry hash. Alpha64×64:zero2210/opaque1880/semi6; original transparent=true/alphaTest0/depthWrite=false/FrontSide. Solid-front/double одинаковы48/48. Original/double:RGBA48,coverage44; original/cutout:RGBA44,coverage11, без прироста, максимум-23 пикселя. Пользователь: PNG выглядят нормально, дефект был лишь на некоторых живых углах. Не выдавать эти числа за исправление. Затем телефон подтвердил успех depth-write и частичный успех full-size отдельно.

Перед соответствующими коммитами локально прошли6 depth-policy и3 full-size permanent tests с mocks; это НЕ единый HEAD CI/GPU/Android. CPU-аудиты132 UV-граней и22 боксов/264 треугольников тоже не браузерная приёмка.

Drive report.json ID11gik-65RyKMrzZlq93nsfCXX8Y7fQdrj прочитан через files/search_files_v2 → read_file и Python. PNG пользователь ЗАГРУЗИЛ, поиск не вернул: не спорить о наличии/не обещать поддержку PNG. Вложения расходуют его лимит уже при добавлении в черновик; новых не просить. GitHub MCP в этом сеансе без Actions-read, web-доступ к runs не удался. В новом чате проверить инструменты заново, не считать ограничение вечным.

## Прежняя база, которую не повторять

Play/Pause702f28a/7b10d0d и lazy banner thumbnails32ef4d1/2b33040 УЖЕ записаны. • icon840a451 есть; carried бамбука не доказанно сломан. Compiled families/aliases/double slabs/items75/frame-history-PNG/GPU reuse, signs/cave-vines/hanging/observer, banner layers/groups/cauldron/usage, MERS без PBR/conduit UV сохранены.

mkFile77bd1fb/rejected94a1185/диагностика84b04ac,7520b15,6391cde,b72d421 уже есть. acacia_shelf первопричина неизвестна; header checks не PNG decode/CRC. Не очищать данные/кэш и не требовать повторов без основания.

Детальная прежняя история и модельные контракты сохранены в CONTEXT.md/ARCHITECTURE.md на Git SHA30b51e2be09edb90082687af99d98b7bca470cc8. Остаются обязательными, кроме явно обновлённых выше статусов; получать точечно при работе с соответствующим контрактом. Это не указание заново читать все чаты.

Только main, <25000 UTF-8 bytes/file, точное подтверждение write → saved diff/content. Backup/refactor-0.9/fk070_packs/localStorage/PIN46ba6ea985fb5a92d79a9419198f10dda14c199d не трогать. Массовые opaque/DoubleSide/depthWrite/pixel snapping и scale не применять. Сейчас для передачи от пользователя файлов/проверок не требуется.
