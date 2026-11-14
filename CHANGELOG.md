# [1.9.0](https://github.com/josesaranda/HabitMaker/compare/v1.8.0...v1.9.0) (2026-11-13)


### Bug Fixes

* **analytics:** replace inject with Analytics component in BaseLayout ([79dfdc4](https://github.com/josesaranda/HabitMaker/commit/79dfdc497e70112aa7ae33ac5583fec23e977f9b))
* **ci:** update CI workflow to use nx affected commands for linting and testing ([2b595d0](https://github.com/josesaranda/HabitMaker/commit/2b595d07d54c4b5ae12e0e4eedf0cc8edcba9d6a))
* **deps:** remove unused dependencies from package-lock.json ([30de650](https://github.com/josesaranda/HabitMaker/commit/30de6505467e0c116483a18fbf9d5f7abd2a033d))
* **layout:** move Analytics component to body in BaseLayout ([e642b00](https://github.com/josesaranda/HabitMaker/commit/e642b0011e81ae0c2676a459428da8e6caea35b5))
* **svg:** update settings icon structure and remove unused paths ([091a671](https://github.com/josesaranda/HabitMaker/commit/091a6719c6795574d73da812bddc684ef509161e))


### Features

* add habit maker UI components including button day, card, and day selector ([36aeccd](https://github.com/josesaranda/HabitMaker/commit/36aeccd1cf116873a8fb9900536c98988c2f5798))
* add habit-maker-ui-header-outlet component for improved header management ([825020f](https://github.com/josesaranda/HabitMaker/commit/825020fec46f5686e43c9d9e3a391cb1a5fb7601))
* add mobile navbar padding and preview completion offsets to HabitCard ([43b502b](https://github.com/josesaranda/HabitMaker/commit/43b502bd720d649b41f455f6ee2b2510d29c649f))
* **docs:** add detailed documentation for HabitMakerUIHeaderOutlet component ([5afd09d](https://github.com/josesaranda/HabitMaker/commit/5afd09dccac0e953a89e332360a41d15a317c62b))
* **docs:** enhance documentation for various HabitMaker UI components ([081cef5](https://github.com/josesaranda/HabitMaker/commit/081cef57269f935021934fe53373a12365353ea1))
* enable day toggle functionality in HabitCard and update related tests ([be570fb](https://github.com/josesaranda/HabitMaker/commit/be570fb4ff0053cf0b5e7126183818f007932153))
* implement habit editing functionality with UI updates and tests ([600b95b](https://github.com/josesaranda/HabitMaker/commit/600b95b197b36a3449f71d763c6efae28afac438))
* **ui:** add Storybook and badge component ([7c09a40](https://github.com/josesaranda/HabitMaker/commit/7c09a40e7d4940740cecff726771b7a45095e9e4))

# [1.8.0](https://github.com/josesaranda/HabitMaker/compare/v1.7.0...v1.8.0) (2026-11-06)


### Bug Fixes

* **ci:** gate releases on affected apps ([817d5b1](https://github.com/josesaranda/HabitMaker/commit/817d5b1e8b13c7a13f3819aef5c109ff2bfb3739))
* **landing:** improve responsive navigation ([19a0107](https://github.com/josesaranda/HabitMaker/commit/19a01071879fa05b83327c02fce522c1d3d76b28))


### Features

* **auth:** implement session management for user authentication ([2bcb77a](https://github.com/josesaranda/HabitMaker/commit/2bcb77abf480d96c6a70259b3aeddd23d0436252))
* **landing:** add social sharing cards [skip ci] ([06bb23f](https://github.com/josesaranda/HabitMaker/commit/06bb23ff099ac0aaa2c3355f35eae6831482e0a7))
* update environment variables and JWT handling; add tests for JWT expiration ([125c5c1](https://github.com/josesaranda/HabitMaker/commit/125c5c15edae857df41bed570b872a6ddff1c79d))

# [1.7.0](https://github.com/josesaranda/HabitMaker/compare/v1.6.0...v1.7.0) (2026-11-04)


### Features

* **landing:** add landing page and language picker components with internationalization support ([5184ac6](https://github.com/josesaranda/HabitMaker/commit/5184ac6273b6a3008d3e604f183e176cec526406))
* **landing:** add landing page support and update dependencies ([d94c525](https://github.com/josesaranda/HabitMaker/commit/d94c525598c9b355e43ebe5fe1e231c4badff655))

# [1.6.0](https://github.com/josesaranda/HabitMaker/compare/v1.5.0...v1.6.0) (2026-11-03)


### Bug Fixes

* **ui:** hide reminders without VAPID configuration ([3d9f1ee](https://github.com/josesaranda/HabitMaker/commit/3d9f1ee6a8171c7191691075dc44a4374a24e174))


### Features

* **admin:** show push configuration status ([a13d6ac](https://github.com/josesaranda/HabitMaker/commit/a13d6ac930644312e0e73ac3915bbb0b8bd131ec))
* **push:** add scheduled habit reminders ([#2](https://github.com/josesaranda/HabitMaker/issues/2)) ([b154222](https://github.com/josesaranda/HabitMaker/commit/b15422200331d99c89c4f3ce0c95224bfe8f339a))
* **push:** localize notifications per device ([5d977df](https://github.com/josesaranda/HabitMaker/commit/5d977df9a3e3017922696e53696efaa3b10b5747))
* **ui:** defer reminder time changes until save ([96eabba](https://github.com/josesaranda/HabitMaker/commit/96eabba9669ee6212fa9c5ee23289c3df34ac40d))

# [1.5.0](https://github.com/josesaranda/HabitMaker/compare/v1.4.0...v1.5.0) (2026-11-03)


### Bug Fixes

* **api:** include root package in build cache inputs ([71acfea](https://github.com/josesaranda/HabitMaker/commit/71acfea07d0a184cf57f076eda75bbd48303d2f1))
* **docker:** pin node image to nvmrc version ([9cba39d](https://github.com/josesaranda/HabitMaker/commit/9cba39d222d9e948872268cb3f5b29b4b3d65281))
* **habit:** replace history when navigating days ([6f657df](https://github.com/josesaranda/HabitMaker/commit/6f657df66e27edc56c0d58ca167084b726143551))
* **release:** sync package lock version ([0eeccc9](https://github.com/josesaranda/HabitMaker/commit/0eeccc9f1b663dffd6982071e03b60298e25c61a))
* **ui:** adjust spacing and layout in various components ([20a0703](https://github.com/josesaranda/HabitMaker/commit/20a0703fde6b6d27127ecfa3235862b6ff3be06a))


### Features

* **habits:** add habit deletion ([4334b03](https://github.com/josesaranda/HabitMaker/commit/4334b036fbed20ab41b2a13ff940f0a94a80f70c))

# [1.4.0](https://github.com/josesaranda/HabitMaker/compare/v1.3.0...v1.4.0) (2026-11-03)


### Bug Fixes

* **auth:** make copyright year dynamic ([d668d2b](https://github.com/josesaranda/HabitMaker/commit/d668d2be4c1d65d2a204b657d65a65f8ed8c0758))
* **ui:** focus habit name on modal open ([b260def](https://github.com/josesaranda/HabitMaker/commit/b260def9ba7b4f911e072072650d3db346150806))


### Features

* **admin:** configure SMTP email delivery ([ba895ea](https://github.com/josesaranda/HabitMaker/commit/ba895eafbae2c9b984460b2d8bd178f25f190984))
* **auth:** add password reset flow ([b1bab12](https://github.com/josesaranda/HabitMaker/commit/b1bab12214e762f50fa3a854598f494ed8dd6086))
* **pwa:** configure HabitMaker as PWA ([3f49832](https://github.com/josesaranda/HabitMaker/commit/3f49832976f740a224b4964f18c2f4edcd3bb46b))
* **ui:** add actions to home header ([4e1d134](https://github.com/josesaranda/HabitMaker/commit/4e1d1343981d7a87d3082d803476b66b1c3ad5d9))

# [1.3.0](https://github.com/josesaranda/HabitMaker/compare/v1.2.0...v1.3.0) (2026-11-03)


### Features

* **api:** add optional PostgreSQL database ([f20e400](https://github.com/josesaranda/HabitMaker/commit/f20e40087666d6b8a639751da255e26748a7c552))
* **docker:** containerize full application stack ([6daa3e1](https://github.com/josesaranda/HabitMaker/commit/6daa3e10900d72adfab626c32aa1ccf3be3facc5))
* **ui:** add accessible select component ([025d04f](https://github.com/josesaranda/HabitMaker/commit/025d04facae3b3a6bf39c31beb8cfaaa592a42e8))

# [1.2.0](https://github.com/josesaranda/HabitMaker/compare/v1.1.0...v1.2.0) (2026-11-02)


### Features

* **i18n:** add English and Spanish translations ([c2c347c](https://github.com/josesaranda/HabitMaker/commit/c2c347c91483e3cffe4b29915ad495d5ad2adee9))
* **settings:** add admin version update checks ([eba0151](https://github.com/josesaranda/HabitMaker/commit/eba0151acff4585fa720628008e62cc6f8586941))

# [1.1.0](https://github.com/josesaranda/HabitMaker/compare/v1.0.0...v1.1.0) (2026-11-02)


### Features

* add MIT License to the repository ([8c2b44a](https://github.com/josesaranda/HabitMaker/commit/8c2b44a0edbcb0f67beb498565e4d9124063dd7f))

# 1.0.0 (2026-11-02)


### Bug Fixes

* **env:** update environment variable name from PORT to SERVER_PORT ([41ab471](https://github.com/josesaranda/HabitMaker/commit/41ab471d4b57e5b0a08d55a2f51ef7e03bee0eff))
* **settings:** adjust header structure for user settings page ([95ff140](https://github.com/josesaranda/HabitMaker/commit/95ff14093b5e0c6f76ae260c6d88ce305b4a4b1d))


### Features

* add API start script and update dependencies for NestJS and Webpack ([fe5703f](https://github.com/josesaranda/HabitMaker/commit/fe5703f2d34e22641e9eb36c2e46ae569b913e74))
* add guest guard for login and signup routes and update routing configuration ([5f9eafc](https://github.com/josesaranda/HabitMaker/commit/5f9eafc559cc3c7676971c58be6b5f0eab0a8426))
* add HabitMakerUI library with initial components and styles ([8f9bb5e](https://github.com/josesaranda/HabitMaker/commit/8f9bb5e057791183b085afa7588ad03144a3ed54))
* add login and signup components with UI elements ([2f6fdcf](https://github.com/josesaranda/HabitMaker/commit/2f6fdcf1f5cfcda63901aa22265207f37b604e37))
* add project guide and structure details to README and create SKILL.md ([ae98143](https://github.com/josesaranda/HabitMaker/commit/ae981433a53a1cdb7a19b82ff219a26aa71f68e3))
* add recover password feature with routing, UI, and tests ([e78e3cf](https://github.com/josesaranda/HabitMaker/commit/e78e3cf4c22db8c2d3583eb2cb1b3169ad1c86a7))
* **admin:** implement admin role guard, user management, and settings UI ([45c84e1](https://github.com/josesaranda/HabitMaker/commit/45c84e13fb0cf2748be7891b1a3a27026124b621))
* **api:** enable CORS with configurable origin ([27479de](https://github.com/josesaranda/HabitMaker/commit/27479deb9d0134be805407af34aa8a241d9d11a3))
* **auth:** implement auth token interceptor and refactor habit service for token management ([aaf95e1](https://github.com/josesaranda/HabitMaker/commit/aaf95e14c3054821d2588609cf15e9020477cdf4))
* **auth:** integrate TypeORM for user management and JWT authentication ([b03e4ef](https://github.com/josesaranda/HabitMaker/commit/b03e4efbbafea9f759a824769fd72c12a26e20d1))
* **auth:** seed admin user from environment variables and update role handling ([adc6ac8](https://github.com/josesaranda/HabitMaker/commit/adc6ac847c3eacd60d04780c2507283e8a8d59bb))
* **browser:** implement BrowserService for dynamic page title management across components ([befc036](https://github.com/josesaranda/HabitMaker/commit/befc0369c744dcb2729ea1a029911318a1b6cb5f))
* enhance authentication flow with session management and UI updates ([9ec48ba](https://github.com/josesaranda/HabitMaker/commit/9ec48ba020f70b6ae9f08fa394715b5cb3eccfd5))
* enhance logout functionality to defer state update and sync authenticated state ([ffdfc9b](https://github.com/josesaranda/HabitMaker/commit/ffdfc9b7a179d6fb4b161540127ba2a0a5db5acc))
* enhance UI components with button variants and link styles ([1a86e1c](https://github.com/josesaranda/HabitMaker/commit/1a86e1c10f999e8b867df50325e8cd8f142af14b))
* **habit-card:** add day of month display to habit card and update tests ([1adc1ec](https://github.com/josesaranda/HabitMaker/commit/1adc1ece8bf0864cf3534c203019c8a9689df575))
* **habit-card:** add interactive date navigation ([4b21135](https://github.com/josesaranda/HabitMaker/commit/4b2113557ab82f669e26fe00b0c3188f8238339b))
* **habit-card:** create habit card component with template and styles ([483e7fc](https://github.com/josesaranda/HabitMaker/commit/483e7fc8c3ec270e850c4cd49f6e30c9e962e3dc))
* **habit-card:** enhance hover effects for habit card link ([7c20d82](https://github.com/josesaranda/HabitMaker/commit/7c20d825e032170dbc7a74fb39fa57c9bdb0898b))
* **habit-card:** refactor habit days display using computed properties and signals ([8b15ef9](https://github.com/josesaranda/HabitMaker/commit/8b15ef9673afdd46a66c55b55ba865d2b1de79ba))
* **habit-card:** refine layout and update time display for habit progress ([f3a55f7](https://github.com/josesaranda/HabitMaker/commit/f3a55f7cb4d7f7d05de34b35ce6c5eed284a9c4f))
* **habit-card:** toggle daily completion states ([948fda6](https://github.com/josesaranda/HabitMaker/commit/948fda61f3b1acd3bbfe04ae79717626f3bb5b32))
* **habit-completion:** add support for retrieving completion statuses for specific dates ([618b781](https://github.com/josesaranda/HabitMaker/commit/618b781162763a4a4217c8c01996d0a29d113123))
* **habit-completion:** implement habit completion tracking and management ([feb245e](https://github.com/josesaranda/HabitMaker/commit/feb245e13cdff262208eb166f79c724c0e1ab2c8))
* **habit-detail:** add completion status section and button for marking habits as completed ([009e54c](https://github.com/josesaranda/HabitMaker/commit/009e54c0b731fd139b40e24a9a1cde0fcdda42c7))
* **habit-detail:** implement habit detail view and routing for individual habits ([dc7d9c4](https://github.com/josesaranda/HabitMaker/commit/dc7d9c41d5d49706024fbc146f6f0cb645dc581a))
* **habits:** add user-specific habit retrieval and implement findAll method ([fd86f22](https://github.com/josesaranda/HabitMaker/commit/fd86f22d5087838bd1d67b17d77211a98a8db0f2))
* **habits:** fire confetti at completed day ([ccdbf1e](https://github.com/josesaranda/HabitMaker/commit/ccdbf1e38b159102703c1b52569ac32240e0ec8e))
* **habits:** implement habit creation event handling and update UI accordingly ([c6f5912](https://github.com/josesaranda/HabitMaker/commit/c6f59126682861f06a75df97afc1ef955b654225))
* **habits:** implement habit management with creation, validation, and user association ([634ce11](https://github.com/josesaranda/HabitMaker/commit/634ce11c24c9f5dd0359031127b57cb0b609e423))
* **home:** add title to habits section and update tests for visibility ([acc5f65](https://github.com/josesaranda/HabitMaker/commit/acc5f65f0765ea19d017a09e7ebc4988cf7883e5))
* **home:** implement new habit creation modal and update home page layout ([d15ca83](https://github.com/josesaranda/HabitMaker/commit/d15ca834ef8819168c3d7de5f140111ace40b7ca))
* **icons:** add check and clock SVG icons; update HabitMakerUIIcon to include new icons ([b705490](https://github.com/josesaranda/HabitMaker/commit/b705490be8909cd7695862314d12ee23390bcb79))
* implement authentication flow with login, signup, and home components ([9ec479d](https://github.com/josesaranda/HabitMaker/commit/9ec479d34cf803ff7d24c21e042ff8c9c1fad3b4))
* implement authentication module with signup, login, and forgot password functionality ([0302db2](https://github.com/josesaranda/HabitMaker/commit/0302db29945c6490f15464214493732c695c8125))
* implement navbar with logout functionality and integrate UI icons ([6ef65dd](https://github.com/josesaranda/HabitMaker/commit/6ef65dd27c1a954430954eebbcb84d12a637845b))
* implement responsive navbar component with logout functionality and UI updates ([8cc72c1](https://github.com/josesaranda/HabitMaker/commit/8cc72c125302a513bb0b26aed66be5c99e175b27))
* integrate AuthStory component into login, signup, and recover password pages ([25d2d6a](https://github.com/josesaranda/HabitMaker/commit/25d2d6aecdd5e9857734622ee7c2d0edfdd86a67))
* **navbar, layout:** enhance responsive design and update navbar styles for better usability ([c4acddd](https://github.com/josesaranda/HabitMaker/commit/c4acddd21ea9b244c649e34f83cb72b9a953c33c))
* **navbar:** add mobile settings link and corresponding icon ([dca8f81](https://github.com/josesaranda/HabitMaker/commit/dca8f81c18ff8dc8699706252c898a96c76f67aa))
* **new-habit:** implement reactive form for habit creation and update validation logic ([5405ff3](https://github.com/josesaranda/HabitMaker/commit/5405ff311654c11cb426899f1f9a57d530e72dd0))
* refactor authentication components to use Angular signals and update UI branding ([e0e173f](https://github.com/josesaranda/HabitMaker/commit/e0e173f9b9928fafe9ff05e36050806553bc00e9))
* refactor signup component to use Angular signals for state management ([22075fd](https://github.com/josesaranda/HabitMaker/commit/22075fdfea496203219f1f28f4d77ab9a3718e98))
* **release:** configure semantic-release and commit guidance ([6dc305f](https://github.com/josesaranda/HabitMaker/commit/6dc305f25b880081580a266d917e6f5f6928f0da))
* **routes:** add resolvers for habit detail and home habits ([322eabe](https://github.com/josesaranda/HabitMaker/commit/322eabe85af70109dbb126237939cf5af4b5b222))
* **settings:** add settings page with user email display and routing ([6e80c19](https://github.com/josesaranda/HabitMaker/commit/6e80c194de1d68da129edf25a9a3489953040fe5))
* **ui:** add new button icon component and integrate add icon ([740b8da](https://github.com/josesaranda/HabitMaker/commit/740b8da30732d4d6e022b329315804711b0db835))
* **ui:** add reusable page header ([bc6335b](https://github.com/josesaranda/HabitMaker/commit/bc6335b0d9b0d36be1bac418e54f709a856c95d3))
* update navbar visibility logic and enhance routing with reactive state management ([5de4802](https://github.com/josesaranda/HabitMaker/commit/5de4802c4fdb6ffb74d12fa975a19649cb221897))
* update SKILL.md with CSS class naming conventions and styling guidelines ([2587731](https://github.com/josesaranda/HabitMaker/commit/2587731897ce5ee0fe6ddf58aa08de540ae01cd6))
