# Setup computer to use local.domain.com

brew install dnsmasq
echo "address=/local.domain.com/{{IP}}" > /opt/homebrew/etc/dnsmasq.d/local-domain.conf
sudo brew services start dnsmasq
sudo touch /etc/resolver/local.domain.com
echo "nameserver 127.0.0.1" | sudo tee /etc/resolver/local.domain.com

