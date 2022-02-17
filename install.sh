sudo apt update -y
sudo apt upgrade -y
sudo apt install python3-dev -y python3-setuptools -y python3-pip -y python3-smbus -y
sudo apt install \
    build-essential -y\
    curl -y\
    libbz2-dev -y\
    libffi-dev -y\
    liblzma-dev -y\
    libncursesw5-dev -y\
    libreadline-dev -y\
    libsqlite3-dev -y\
    libssl-dev -y\
    libxml2-dev -y\
    libxmlsec1-dev -y\
    llvm -y\
    make -y\
    tk-dev -y\
    wget -y\
    xz-utils -y\
    zlib1g-dev -y

##pyenv
git clone https://github.com/pyenv/pyenv.git ~/.pyenv
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo -e 'if command -v pyenv 1>/dev/null 2>&1; then\n  eval "$(pyenv init -)"\nfi' >> ~/.bashrc
exec "$SHELL"

##pyenv-virtualenv
git clone https://github.com/pyenv/pyenv-virtualenv.git $(pyenv root)/plugins/pyenv-virtualenv
echo 'eval "$(pyenv virtualenv-init -)"' >> ~/.bashrc
exec "$SHELL"

#docker
sudo apt install \
	apt-transport-https \
	ca-certificates \
	software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo apt-key fingerprint 0EBFCD88
sudo add-apt-repository \
	   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
	      $(lsb_release -cs) \
	         stable"
sudo apt update
sudo apt install docker-ce -y
### non-root user ###
sudo groupadd docker
sudo usermod -aG docker $USER

#nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

#npm
nvm install node
